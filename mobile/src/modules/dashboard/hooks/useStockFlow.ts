import { useState } from "react";
import { Alert } from "react-native";

type UseStockFlowParams = {
  selectedPeriod: number;
  onPeriodChange: (days: number) => void;
};

export function useStockFlow({
  selectedPeriod,
  onPeriodChange,
}: UseStockFlowParams) {
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);

  function togglePeriodMenu() {
    setPeriodMenuOpen((current) => !current);
  }

  function handlePeriodChange(days: number) {
    setPeriodMenuOpen(false);

    if (days !== selectedPeriod) {
      onPeriodChange(days);
    }
  }

  function showTurnoverInfo() {
  Alert.alert(
    "Giro de estoque",
    "Indica o percentual do valor médio do estoque consumido pelas saídas registradas no período. O cálculo considera o custo dos produtos.",
  );
}

  return {
    periodMenuOpen,
    togglePeriodMenu,
    handlePeriodChange,
    showTurnoverInfo,
  };
}
