import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getStockMovements,
  getStockMovementCounts,
} from "../stockMovementService";
import type {
  StockMovement,
} from "../stockMovement.types";
import type { MovementFilter } from "../../../components/movements/MovementsFilters";

type MovementStats = {
  total: number;
  previousTotal: number;
  IN: number;
  OUT: number;
  ADJUSTMENT: number;
};

function dateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthRange(offset = 0) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);

  return {
    startDate: dateString(firstDay),
    endDate: dateString(lastDay),
  };
}

export function useMovements(accessToken: string | null | undefined) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<MovementFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    ALL: 0,
    IN: 0,
    OUT: 0,
    ADJUSTMENT: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<MovementStats>({
    total: 0,
    previousTotal: 0,
    IN: 0,
    OUT: 0,
    ADJUSTMENT: 0,
  });

  const loadStats = useCallback(async () => {
    if (!accessToken) return;

    const current = getMonthRange(0);
    const previous = getMonthRange(-1);

    try {
      const [currentTotal, previousTotal, entries, exits, adjustments] =
        await Promise.all([
          getStockMovements(accessToken, {
            page: 1,
            pageSize: 1,
            startDate: current.startDate,
            endDate: current.endDate,
          }),
          getStockMovements(accessToken, {
            page: 1,
            pageSize: 1,
            startDate: previous.startDate,
            endDate: previous.endDate,
          }),
          getStockMovements(accessToken, {
            page: 1,
            pageSize: 1,
            movementType: "IN",
            startDate: current.startDate,
            endDate: current.endDate,
          }),
          getStockMovements(accessToken, {
            page: 1,
            pageSize: 1,
            movementType: "OUT",
            startDate: current.startDate,
            endDate: current.endDate,
          }),
          getStockMovements(accessToken, {
            page: 1,
            pageSize: 1,
            movementType: "ADJUSTMENT",
            startDate: current.startDate,
            endDate: current.endDate,
          }),
        ]);

      setStats({
        total: currentTotal.total,
        previousTotal: previousTotal.total,
        IN: entries.total,
        OUT: exits.total,
        ADJUSTMENT: adjustments.total,
      });
    } catch {
      // As estatísticas não impedem a exibição do histórico.
    }
  }, [accessToken]);

  const loadMovements = useCallback(
    async (_nextPage = 1, _append = false) => {
      if (!accessToken) return;

      try {
        setError(null);
        setLoading(true);

        const first = await getStockMovements(accessToken, {
          page: 1,
          pageSize: 100,
          movementType: selectedFilter === "ALL" ? undefined : selectedFilter,
        });

        let all = [...first.items];

        for (let next = 2; next <= first.total_pages; next += 1) {
          const response = await getStockMovements(accessToken, {
            page: next,
            pageSize: 100,
            movementType: selectedFilter === "ALL" ? undefined : selectedFilter,
          });
          all = all.concat(response.items);
        }

        setMovements(all);
        setTotal(first.total);
        setPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar as movimentações.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, selectedFilter],
  );

  useEffect(() => {
    loadMovements(1, false);
  }, [loadMovements]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!accessToken) return;

    getStockMovementCounts(accessToken)
      .then(setCounts)
      .catch((err) => {
        console.error(
          "Erro ao carregar contagens das movimentações:",
          err,
        );
      });
  }, [accessToken]);

  const filteredMovements = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase("pt-BR");

    return [...movements]
      .filter((movement) => {
        if (!term) return true;

        return [
          movement.product_name,
          movement.product_sku,
          movement.reason ?? "",
          movement.notes ?? "",
        ].some((value) =>
          value.toLocaleLowerCase("pt-BR").includes(term),
        );
      })
      .sort((a, b) => {
        const difference =
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime();

        return sortNewest ? -difference : difference;
      });
  }, [movements, searchTerm, sortNewest]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredMovements.length / pageSize));
  const paginatedMovements = filteredMovements.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedFilter]);

  const percentageChange =
    stats.previousTotal > 0
      ? ((stats.total - stats.previousTotal) / stats.previousTotal) * 100
      : null;

  const percentageLabel =
    percentageChange === null
      ? stats.total > 0
        ? "Novas movimentações neste mês"
        : "Sem movimentações no mês"
      : `${percentageChange >= 0 ? "+" : ""}${percentageChange.toFixed(0)}% em relação ao mês anterior`;

  const handleFilterChange = useCallback(
    (filter: MovementFilter) => {
      if (filter === selectedFilter) return;

      setSelectedFilter(filter);
      setPage(1);
    },
    [selectedFilter],
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadMovements(1, false);
    loadStats();
  }, [loadMovements, loadStats]);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(Math.max(1, Math.min(totalPages, nextPage)));
  }, [totalPages]);

  return {
    movements,
    selectedFilter,
    searchInput,
    setSearchInput,
    searchTerm,
    setSearchTerm,
    sortNewest,
    setSortNewest,
    page,
    total,
    counts,
    totalPages,
    loading,
    refreshing,
    error,
    stats,
    filteredMovements,
    paginatedMovements,
    percentageChange,
    percentageLabel,
    loadMovements,
    handleFilterChange,
    handleRefresh,
    handlePageChange,
  };
}

