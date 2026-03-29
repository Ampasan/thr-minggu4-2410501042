import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { getData, saveData } from '../utils/storage';

const STORAGE_KEY = '@baraya/family-visits';

const VisitsContext = createContext(null);

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function visitsReducer(state, action) {
  switch (action.type) {
    case 'INIT_VISITS': {
      const visits = action.payload?.visits;
      if (!Array.isArray(visits)) return state;
      return { ...state, visits };
    }

    case 'ADD_VISIT': {
      const { name, address, visited } = action.payload || {};
      if (typeof name !== 'string' || name.trim().length === 0) return state;

      const nextVisit = {
        id: createId(),
        name: name.trim(),
        address: typeof address === 'string' ? address.trim() : '',
        visited: Boolean(visited),
      };

      return { ...state, visits: [...state.visits, nextVisit] };
    }

    case 'TOGGLE_VISIT': {
      const id = action.payload?.id;
      return {
        ...state,
        visits: state.visits.map((v) => (v.id === id ? { ...v, visited: !v.visited } : v)),
      };
    }

    case 'DELETE_VISIT': {
      const id = action.payload?.id;
      return { ...state, visits: state.visits.filter((v) => v.id !== id) };
    }

    default:
      return state;
  }
}

export function VisitsProvider({ children }) {
  const [state, dispatch] = useReducer(visitsReducer, { visits: [] });
  const [hydrated, setHydrated] = React.useState(false);
  const lastSavedRawRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const parsed = await getData(STORAGE_KEY);
        if (!mounted) return;
        if (Array.isArray(parsed)) {
          const safeVisits = parsed
            .filter((x) => x && typeof x.id === 'string' && typeof x.name === 'string')
            .map((x) => ({
              id: x.id,
              name: String(x.name).trim(),
              address: typeof x.address === 'string' ? x.address.trim() : '',
              visited: Boolean(x.visited),
            }))
            .filter((x) => x.name.length > 0);

          lastSavedRawRef.current = JSON.stringify(safeVisits);
          dispatch({ type: 'INIT_VISITS', payload: { visits: safeVisits } });
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
    const nextRaw = JSON.stringify(state.visits);
    if (lastSavedRawRef.current === nextRaw) return;
    lastSavedRawRef.current = nextRaw;
    saveData(STORAGE_KEY, state.visits);
  }, [hydrated, state.visits]);

  const addVisit = useCallback((payload) => {
    dispatch({ type: 'ADD_VISIT', payload });
  }, []);

  const toggleVisit = useCallback((id) => {
    dispatch({ type: 'TOGGLE_VISIT', payload: { id } });
  }, []);

  const deleteVisit = useCallback((id) => {
    dispatch({ type: 'DELETE_VISIT', payload: { id } });
  }, []);

  const visitedCount = useMemo(() => state.visits.filter((v) => v.visited).length, [state.visits]);
  const totalCount = state.visits.length;
  const progressRatio = totalCount === 0 ? 0 : visitedCount / totalCount;
  const progressPercentage = Math.round(progressRatio * 100);

  const value = useMemo(() => {
    return {
      visits: state.visits,
      addVisit,
      toggleVisit,
      deleteVisit,
      visitedCount,
      totalCount,
      progressRatio,
      progressPercentage,
      isHydrated: hydrated,
    };
  }, [
    addVisit,
    deleteVisit,
    hydrated,
    progressPercentage,
    progressRatio,
    state.visits,
    toggleVisit,
    totalCount,
    visitedCount,
  ]);

  return <VisitsContext.Provider value={value}>{children}</VisitsContext.Provider>;
}

export function useVisitsContext() {
  const ctx = useContext(VisitsContext);
  if (!ctx) throw new Error('useVisitsContext harus digunakan di dalam VisitsProvider');
  return ctx;
}

export default VisitsContext;
