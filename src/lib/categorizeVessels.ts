import { Vessel, Alert } from "@/lib/api";

export interface VesselCategory {
  count: number;
  vessels: string[];
}

export type VesselCategories = Record<string, VesselCategory>;

/**
 * Categorize vessels based on their status and alerts
 */
export function categorizeVessels(vessels: Vessel[], alerts: Alert[]): VesselCategories {
  const categories: VesselCategories = {};
  
  // Create a set of vessel IDs that have alerts
  const vesselsWithAlerts = new Set(alerts.map(a => a.vessel_id));
  
  // Start with vessels that have no alerts (Operação normal)
  const normalOperationVessels = vessels.filter(v => !vesselsWithAlerts.has(v.vessel_id));
  if (normalOperationVessels.length > 0) {
    categories["Operação normal"] = {
      count: normalOperationVessels.length,
      vessels: normalOperationVessels.map(v => v.vessel_id)
    };
  }

  // Group alerts by type and map to categories
  const alertsByType = alerts.reduce((acc, alert) => {
    if (!acc[alert.type]) {
      acc[alert.type] = [];
    }
    acc[alert.type].push(alert.vessel_id);
    return acc;
  }, {} as Record<string, string[]>);

  // Map alert types to user-friendly category names
  const alertTypeMapping: Record<string, string> = {
    "BloqueioDocumental": "Pendente/irregular (documentos)",
    "AcessoPendente": "Pendente (acesso)",  
    "AcessoNegado": "Negado (acesso)",
    "TerminalAguardando": "Aguardando navio",
    "DataMismatch": "Pendente (manobra)",
  };

  // Create categories from alerts
  Object.entries(alertsByType).forEach(([alertType, vesselIds]) => {
    const categoryName = alertTypeMapping[alertType] || alertType;
    if (categories[categoryName]) {
      // Merge with existing category
      categories[categoryName].count += vesselIds.length;
      categories[categoryName].vessels = [...new Set([...categories[categoryName].vessels, ...vesselIds])];
    } else {
      categories[categoryName] = {
        count: vesselIds.length,
        vessels: [...new Set(vesselIds)] // Remove duplicates
      };
    }
  });

  // Add categories based on vessel status
  vessels.forEach(vessel => {
    const statusMapping: Record<string, string> = {
      "bloqueado_documento": "Aguardando documentação (operação)",
      "pendente_autorizacao": "Aguardando autorização (doc)",
      "conflito_horarios": "Atraso/retardo",
      "aguardando_navio": "Aguardando navio",
      "bloqueado": "Cancelado (operação)",
    };

    const statusCategory = statusMapping[vessel.statusResumo];
    if (statusCategory) {
      if (categories[statusCategory]) {
        if (!categories[statusCategory].vessels.includes(vessel.vessel_id)) {
          categories[statusCategory].count++;
          categories[statusCategory].vessels.push(vessel.vessel_id);
        }
      } else {
        categories[statusCategory] = {
          count: 1,
          vessels: [vessel.vessel_id]
        };
      }
    }
  });

  // Add additional categories based on vessel data
  vessels.forEach(vessel => {
    // Check for specific status conditions
    if (vessel.agency?.statusDocumentacao === "problema_fiscal") {
      addToCategory(categories, "Problema fiscal", vessel.vessel_id);
    }
    
    if (vessel.terminal?.statusOperacao === "parcial") {
      addToCategory(categories, "Operação parcial", vessel.vessel_id);
    }

    if (vessel.authority?.status === "negado") {
      addToCategory(categories, "Negado (acesso)", vessel.vessel_id);
    }

    if (vessel.pilotage?.status === "cancelada") {
      addToCategory(categories, "Cancelado (manobra)", vessel.vessel_id);
    }

    if (vessel.terminal?.statusOperacao === "cancelada") {
      addToCategory(categories, "Cancelado (operação)", vessel.vessel_id);
    }

    if (vessel.agency?.statusDocumentacao === "cancelado") {
      addToCategory(categories, "Cancelado (documentação)", vessel.vessel_id);
    }

    // Emergency/contingency situations
    if (vessel.authority?.observacoes?.includes("emergência") || 
        vessel.pilotage?.observacoes?.includes("emergência") ||
        vessel.authority?.motivo?.includes("Emergência")) {
      addToCategory(categories, "Emergência/contingência", vessel.vessel_id);
    }
  });

  return categories;
}

function addToCategory(categories: VesselCategories, categoryName: string, vesselId: string) {
  if (categories[categoryName]) {
    if (!categories[categoryName].vessels.includes(vesselId)) {
      categories[categoryName].count++;
      categories[categoryName].vessels.push(vesselId);
    }
  } else {
    categories[categoryName] = {
      count: 1,
      vessels: [vesselId]
    };
  }
}