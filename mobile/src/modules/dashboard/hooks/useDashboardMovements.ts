import { useCallback, useEffect, useMemo, useState } from "react";

import { getDashboardMovements } from "../dashboardService";
import type { DashboardMovementChartItem } from "../dashboard.types";
import { prepareMovementChartData } from "../utils/dashboard.utils";

export function useDashboardMovements(
  accessToken: string | null | undefined,
) {
  const [movements, setMovements] = useState<DashboardMovementChartItem[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMovements = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError("");

      const response = await getDashboardMovements(
        accessToken,
        selectedPeriod,
      );

      setMovements(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as movimentações.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedPeriod]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const handlePeriodChange = useCallback((days: number) => {
    setPeriodMenuOpen(false);
    setSelectedPeriod(days);
  }, []);

  const togglePeriodMenu = useCallback(() => {
    setPeriodMenuOpen((current) => !current);
  }, []);

  const chartData = useMemo(
    () => prepareMovementChartData(movements),
    [movements],
  );

  return {
    chartData,
    selectedPeriod,
    periodMenuOpen,
    loading,
    error,
    handlePeriodChange,
    togglePeriodMenu,
    loadMovements,
  };
}
