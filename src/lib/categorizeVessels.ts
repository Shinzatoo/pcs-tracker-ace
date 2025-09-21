import { Alert, Vessel } from "@/lib/api";

export interface VesselCategory {
  count: number;
  vessels: string[];
}

export type VesselCategories = Record<string, VesselCategory>;

/**
 * Categorizes vessels based on their status and alerts
 */
export function categorizeVessels(vessels: Vessel[], alerts: Alert[]): VesselCategories {
  const categories: VesselCategories = {};
  const vesselsWithAlerts = new Set(alerts.map(a => a.vessel_id));
  
  // Helper function to add vessel to category
  const addToCategory = (categoryName: string, vesselId: string) => {
    if (!categories[categoryName]) {
      categories[categoryName] = { count: 0, vessels: [] };
    }
    if (!categories[categoryName].vessels.includes(vesselId)) {
      categories[categoryName].vessels.push(vesselId);
      categories[categoryName].count = categories[categoryName].vessels.length;
    }
  };

  // First, categorize vessels in "Operação normal" 
  // These are vessels with only minor timing mismatches (DataMismatch with delta < 45min)
  vessels.forEach(vessel => {
    const vesselAlerts = alerts.filter(a => a.vessel_id === vessel.vessel_id);
    const hasOnlyMinorTimingIssues = vesselAlerts.length > 0 && 
      vesselAlerts.every(alert => 
        alert.type === "DataMismatch" && 
        alert.fields?.deltaMin && 
        alert.fields.deltaMin < 45
      );
    
    const hasNoAlertsButCompleted = !vesselsWithAlerts.has(vessel.vessel_id) &&
      vessel.authority?.status === "autorizado" &&
      vessel.pilotage?.status === "realizada" &&
      (vessel.terminal?.statusOperacao === "concluida" || 
       vessel.terminal?.statusOperacao === "concluida_com_atraso");
    
    if (hasOnlyMinorTimingIssues || hasNoAlertsButCompleted) {
      addToCategory("Operação normal", vessel.vessel_id);
    }
  });

  // Categorize based on alerts and vessel status (skip vessels already in "Operação normal")
  vessels.forEach(vessel => {
    const vesselAlerts = alerts.filter(a => a.vessel_id === vessel.vessel_id);
    
    // Skip if already categorized as "Operação normal"
    if (categories["Operação normal"]?.vessels.includes(vessel.vessel_id)) {
      return;
    }
    
    if (vesselAlerts.length === 0) {
      return;
    }

    // Categorize based on documentation status
    if (vessel.agency?.statusDocumentacao === "aguardando_autorizacao") {
      addToCategory("Aguardando autorização (doc)", vessel.vessel_id);
    }
    
    if (vessel.agency?.statusDocumentacao === "pendente_manifesto" || 
        vessel.agency?.statusDocumentacao === "incompleto") {
      addToCategory("Pendente/irregular (documentos)", vessel.vessel_id);
    }
    
    if (vessel.agency?.statusDocumentacao === "cancelado") {
      addToCategory("Cancelado (documentação)", vessel.vessel_id);
    }
    
    if (vessel.agency?.statusDocumentacao === "problema_fiscal") {
      addToCategory("Problema fiscal", vessel.vessel_id);
    }

    // Categorize based on terminal status
    if (vessel.terminal?.statusOperacao === "aguardando_documentacao") {
      addToCategory("Aguardando documentação (operação)", vessel.vessel_id);
    }
    
    if (vessel.terminal?.statusOperacao === "aguardando_navio") {
      addToCategory("Aguardando navio", vessel.vessel_id);
    }
    
    if (vessel.terminal?.statusOperacao === "parcial") {
      addToCategory("Operação parcial", vessel.vessel_id);
    }
    
    if (vessel.terminal?.statusOperacao === "concluida_com_atraso") {
      addToCategory("Atraso/retardo", vessel.vessel_id);
    }
    
    if (vessel.terminal?.statusOperacao === "cancelada") {
      addToCategory("Cancelado (operação)", vessel.vessel_id);
    }

    // Categorize based on authority status
    if (vessel.authority?.status === "pendente") {
      addToCategory("Pendente (acesso)", vessel.vessel_id);
    }
    
    if (vessel.authority?.status === "negado") {
      addToCategory("Negado (acesso)", vessel.vessel_id);
    }

    // Categorize based on pilotage status  
    if (vessel.pilotage?.status === "pendente") {
      addToCategory("Pendente (manobra)", vessel.vessel_id);
    }
    
    if (vessel.pilotage?.status === "cancelada") {
      addToCategory("Cancelado (manobra)", vessel.vessel_id);
    }

    // Check for emergency situations
    if (vessel.authority?.motivo?.toLowerCase().includes("emergência") ||
        vessel.authority?.observacoes?.toLowerCase().includes("emergência") ||
        vessel.pilotage?.motivo?.toLowerCase().includes("emergência")) {
      addToCategory("Emergência/contingência", vessel.vessel_id);
    }
  });

  return categories;
}