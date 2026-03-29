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

const STORAGE_KEY = "@baraya/budget-mudik";

export const BudgetCategories = ["BBM", "Tol", "Makan", "Oleh-oleh", "Lainnya"];

const BudgetContext = createContext(null);

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeAmount(amount) {
  const n =
    typeof amount === "number"
      ? amount
      : Number(String(amount).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

function sanitizeCategory(category) {
  if (BudgetCategories.includes(category)) return category;
  return "Lainnya";
}

function budgetReducer(state, action) {
  switch (action.type) {
    case "INIT": {
      const { items, budgetLimit } = action.payload || {};
      return {
        ...state,
        items: Array.isArray(items) ? items : state.items,
        budgetLimit:
          typeof budgetLimit === "number" &&
          Number.isFinite(budgetLimit) &&
          budgetLimit >= 0
            ? budgetLimit
            : state.budgetLimit,
      };
    }

    case "ADD_EXPENSE": {
      const category = sanitizeCategory(action.payload?.category);
      const amount = normalizeAmount(action.payload?.amount);
      if (amount <= 0) return state;

      const next = {
        id: createId(),
        category,
        amount,
      };
      return { ...state, items: [...state.items, next] };
    }

    case "DELETE_EXPENSE": {
      const id = action.payload?.id;
      return { ...state, items: state.items.filter((x) => x.id !== id) };
    }

    case "SET_BUDGET_LIMIT": {
      const budgetLimit = normalizeAmount(action.payload?.budgetLimit);
      return { ...state, budgetLimit };
    }

    default:
      return state;
  }
}

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(budgetReducer, {
    items: [],
    budgetLimit: 0,
  });
  const [hydrated, setHydrated] = React.useState(false);
  const lastSavedRawRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const parsed = await getData(STORAGE_KEY);
        if (!mounted) return;
        const itemsRaw = Array.isArray(parsed?.items) ? parsed.items : [];
        const items = itemsRaw
          .filter((x) => x && typeof x.id === "string")
          .map((x) => ({
            id: x.id,
            category: sanitizeCategory(x.category),
            amount: normalizeAmount(x.amount),
          }))
          .filter((x) => x.amount > 0);

        const budgetLimit = normalizeAmount(parsed?.budgetLimit);

        dispatch({ type: "INIT", payload: { items, budgetLimit } });
        lastSavedRawRef.current = JSON.stringify({ items, budgetLimit });
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
    const payload = { items: state.items, budgetLimit: state.budgetLimit };
    const nextRaw = JSON.stringify(payload);
    if (lastSavedRawRef.current === nextRaw) return;
    lastSavedRawRef.current = nextRaw;
    saveData(STORAGE_KEY, payload);
  }, [hydrated, state.budgetLimit, state.items]);

  const addExpense = useCallback((category, amount) => {
    dispatch({ type: "ADD_EXPENSE", payload: { category, amount } });
  }, []);

  const deleteExpense = useCallback((id) => {
    dispatch({ type: "DELETE_EXPENSE", payload: { id } });
  }, []);

  const setBudgetLimit = useCallback((budgetLimit) => {
    dispatch({ type: "SET_BUDGET_LIMIT", payload: { budgetLimit } });
  }, []);

  const totalSpent = useMemo(
    () => state.items.reduce((sum, x) => sum + (x.amount || 0), 0),
    [state.items],
  );
  const totalBudget = state.budgetLimit;
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const usageRatio =
    totalBudget <= 0 ? 0 : Math.min(1, totalSpent / totalBudget);
  const usagePercentage = Math.round(usageRatio * 100);

  const byCategory = useMemo(() => {
    const map = new Map(BudgetCategories.map((c) => [c, 0]));
    state.items.forEach((x) =>
      map.set(x.category, (map.get(x.category) || 0) + x.amount),
    );
    return BudgetCategories.map((c) => ({
      category: c,
      amount: map.get(c) || 0,
    }));
  }, [state.items]);

  const chart = useMemo(() => {
    return {
      labels: byCategory.map((x) => x.category),
      datasets: [
        {
          data: byCategory.map((x) => x.amount),
        },
      ],
    };
  }, [byCategory]);

  const value = useMemo(() => {
    return {
      items: state.items,
      budgetLimit: state.budgetLimit,
      addExpense,
      deleteExpense,
      setBudgetLimit,
      totalBudget,
      totalSpent,
      remainingBudget,
      usageRatio,
      usagePercentage,
      chart,
      byCategory,
      isHydrated: hydrated,
      categories: BudgetCategories,
    };
  }, [
    addExpense,
    byCategory,
    chart,
    deleteExpense,
    setBudgetLimit,
    hydrated,
    remainingBudget,
    state.budgetLimit,
    state.items,
    totalBudget,
    totalSpent,
    usagePercentage,
    usageRatio,
  ]);

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}

export function useBudgetContext() {
  const ctx = useContext(BudgetContext);
  if (!ctx)
    throw new Error("useBudgetContext harus digunakan di dalam BudgetProvider");
  return ctx;
}

export default BudgetContext;
