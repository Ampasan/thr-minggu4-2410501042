import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { getData, saveData } from "../utils/storage";

const STORAGE_KEY = "@baraya/packing-items";

const PackingContext = createContext(null);

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function packingReducer(state, action) {
  switch (action.type) {
    case "INIT_ITEMS": {
      const items = action.payload?.items;
      if (!Array.isArray(items)) return state;
      return {
        ...state,
        items,
      };
    }

    case "ADD_ITEM": {
      const name = action.payload?.name;
      if (typeof name !== "string" || name.trim().length === 0) return state;
      const nextItem = {
        id: createId(),
        name: name.trim(),
        checked: false,
      };
      return { ...state, items: [...state.items, nextItem] };
    }

    case "TOGGLE_ITEM": {
      const id = action.payload?.id;
      return {
        ...state,
        items: state.items.map((it) =>
          it.id === id ? { ...it, checked: !it.checked } : it,
        ),
      };
    }

    case "DELETE_ITEM": {
      const id = action.payload?.id;
      return { ...state, items: state.items.filter((it) => it.id !== id) };
    }

    default:
      return state;
  }
}

export function PackingProvider({ children }) {
  const [state, dispatch] = useReducer(packingReducer, { items: [] });
  const [hydrated, setHydrated] = React.useState(false);
  const lastSavedRawRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const parsed = await getData(STORAGE_KEY);
        if (!mounted) return;
        if (Array.isArray(parsed)) {
          const safeItems = parsed
            .filter(
              (x) =>
                x && typeof x.id === "string" && typeof x.name === "string",
            )
            .map((x) => ({
              id: x.id,
              name: x.name,
              checked: Boolean(x.checked),
            }));
          lastSavedRawRef.current = JSON.stringify(safeItems);
          dispatch({ type: "INIT_ITEMS", payload: { items: safeItems } });
        } else {
          lastSavedRawRef.current = JSON.stringify([]);
        }
      } catch (e) {
        lastSavedRawRef.current = null;
      } finally {
        if (mounted) setHydrated(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const nextRaw = JSON.stringify(state.items);
    if (lastSavedRawRef.current === nextRaw) return;
    lastSavedRawRef.current = nextRaw;
    saveData(STORAGE_KEY, state.items);
  }, [hydrated, state.items]);

  const addItem = useCallback((name) => {
    dispatch({ type: "ADD_ITEM", payload: { name } });
  }, []);

  const toggleItem = useCallback((id) => {
    dispatch({ type: "TOGGLE_ITEM", payload: { id } });
  }, []);

  const deleteItem = useCallback((id) => {
    dispatch({ type: "DELETE_ITEM", payload: { id } });
  }, []);

  const value = useMemo(() => {
    return {
      items: state.items,
      packingList: state.items,
      addItem,
      toggleItem,
      deleteItem,

      checkedCount: state.items.filter((it) => it.checked).length,
      totalCount: state.items.length,
      progressRatio:
        state.items.length === 0
          ? 0
          : state.items.filter((it) => it.checked).length / state.items.length,
      isHydrated: hydrated,
    };
  }, [addItem, deleteItem, hydrated, state.items, toggleItem]);

  return (
    <PackingContext.Provider value={value}>{children}</PackingContext.Provider>
  );
}

export function usePackingContext() {
  const ctx = useContext(PackingContext);
  if (!ctx)
    throw new Error(
      "usePackingContext harus digunakan di dalam PackingProvider",
    );
  return ctx;
}

export default PackingContext;
