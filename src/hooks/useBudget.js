import { useBudgetContext } from "../context/BudgetContext";

export function useBudget() {
  const { items, totalBudget, remainingBudget, addExpense, deleteExpense } =
    useBudgetContext();

  return {
    items,
    totalBudget,
    remainingBudget,
    addExpense,
    deleteExpense,
  };
}
