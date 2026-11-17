import type { StockRiskLevel } from "../stockIntelligence.types";

export function getRiskLabel(riskLevel: StockRiskLevel): string {
  switch (riskLevel) {
    case "OUT_OF_STOCK":
      return "Fora de estoque";
    case "CRITICAL":
      return "Crítico";
    case "HIGH":
      return "Alto";
    case "MEDIUM":
      return "Médio";
    case "LOW":
      return "Baixo";
    case "NO_DATA":
      return "Sem dados";
    default:
      return "Atenção";
  }
}

export function getVisibleAlerts<T>(alerts: T[]): T[] {
  return alerts.slice(0, 4);
}
