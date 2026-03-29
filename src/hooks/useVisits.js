import { useVisitsContext } from "../context/VisitsContext";

export function useVisits() {
  const {
    visits,
    addVisit,
    toggleVisit,
    deleteVisit,
    progressPercentage,
    progressRatio,
  } = useVisitsContext();

  return {
    visits,
    addVisit,
    toggleVisit,
    deleteVisit,
    progress:
      typeof progressPercentage === "number"
        ? progressPercentage
        : Math.round((progressRatio || 0) * 100),
  };
}
