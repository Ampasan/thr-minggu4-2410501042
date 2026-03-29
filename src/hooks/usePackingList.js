import { useMemo } from "react";
import { usePackingContext } from "../context/PackingContext";

export function usePackingList() {
  const { items, addItem, toggleItem, deleteItem, progressRatio } =
    usePackingContext();

  const progressPercentage = useMemo(() => {
    const ratio = typeof progressRatio === "number" ? progressRatio : 0;
    return Math.round(ratio * 100);
  }, [progressRatio]);

  return {
    items,
    addItem,
    toggleItem,
    deleteItem,
    progressPercentage,
  };
}
