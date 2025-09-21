/**
 * PCS API Client with auto-discovery capabilities
 * Handles both GET and POST requests to n8n webhook
 */

export interface PcsApiResponse {
  vessels: Vessel[];
  alerts: Alert[];
  counts: Record<string, number>;
  categories?: Record<string, { count: number; vessels: string[] }>;
  kpis?: {
    totalVessels: number;
    totalAlerts: number;
    totalCritical: number;
  };
  generatedAt: string;
}

export interface Vessel {
  vessel_id: string;
  statusResumo: string;
  agency?: AgencyData | null;
  authority?: AuthorityData | null;
  pilotage?: PilotageData | null;
  terminal?: TerminalData | null;
}

export interface AgencyData {
  id: string;
  nomeAgencia?: string;
  manifestoEntregue?: boolean | null;
  statusDocumentacao?: string | null;
  dataEnvioInformacoes?: string | null;
  documentosAdicionais?: any[] | null;
}

export interface AuthorityData {
  id: string;
  tipoMovimentacao?: string | null;
  dataSolicitacao?: string | null;
  dataAutorizacao?: string | null;
  status?: string | null;
  motivo?: string | null;
  observacoes?: string | null;
}

export interface PilotageData {
  id: string;
  tipo?: string | null;
  dataSolicitacao?: string | null;
  dataExecucao?: string | null;
  status?: string | null;
  motivo?: string | null;
  observacoes?: string | null;
}

export interface TerminalData {
  id: string;
  terminal?: string | null;
  dataPrevistaAtracacao?: string | null;
  dataRealAtracacao?: string | null;
  tipoOperacao?: string | null;
  statusOperacao?: string | null;
  observacoes?: string | null;
}

export interface Alert {
  type: string;
  vessel_id: string;
  statusDocumentacao?: string;
  reason?: string;
  suggestion: string;
  fields?: Record<string, any>;
}

export interface PcsFilters {
  status?: string;
  origem?: string;
  periodo?: { start?: string; end?: string };
  search?: string;
}

export interface PcsPagination {
  page?: number;
  limit?: number;
}

export interface PcsSort {
  field?: string;
  direction?: 'asc' | 'desc';
}

class PcsApiClient {
  private baseUrl: string;
  private lastResponse: PcsApiResponse | null = null;
  private lastFetch: Date | null = null;

  constructor() {
    // Support for proxy configuration
    this.baseUrl = import.meta.env.VITE_API_PROXY || 'https://n8n.hackathon.souamigu.org.br/webhook/pcs/status';
  }

  /**
   * Fetch PCS status data with auto-discovery
   */
  async getStatus(params?: {
    filters?: PcsFilters;
    pagination?: PcsPagination;
    sort?: PcsSort;
  }): Promise<PcsApiResponse> {
    try {
      const url = new URL(this.baseUrl);
      
      // Add query parameters if supported
      if (params?.filters?.search) {
        url.searchParams.append('search', params.filters.search);
      }
      if (params?.filters?.status) {
        url.searchParams.append('status', params.filters.status);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Auto-discover and normalize response structure
      const normalizedData = this.normalizeResponse(data);
      
      // Cache the response
      this.lastResponse = normalizedData;
      this.lastFetch = new Date();

      // Log for debugging
      if (normalizedData.vessels.length > 0) {
        console.table(normalizedData.vessels.slice(0, 3)); // Show first 3 vessels
      }
      console.log('PCS API Response:', {
        vesselsCount: normalizedData.vessels.length,
        alertsCount: normalizedData.alerts.length,
        sources: normalizedData.counts
      });

      return normalizedData;

    } catch (error) {
      console.error('PCS API Error:', error);
      throw new Error(`Erro ao buscar dados do PCS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Post filters (if n8n endpoint supports POST)
   */
  async postStatus(params: {
    filters?: PcsFilters;
    pagination?: PcsPagination;
    sort?: PcsSort;
  }): Promise<PcsApiResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return this.normalizeResponse(data);

    } catch (error) {
      console.error('PCS POST API Error:', error);
      // Fallback to GET if POST fails
      return this.getStatus(params);
    }
  }

  /**
   * Auto-discover response structure and normalize
   */
  private normalizeResponse(data: any): PcsApiResponse {
    let normalizedData: PcsApiResponse = {
      vessels: [],
      alerts: [],
      counts: {},
      categories: {},
      kpis: { totalVessels: 0, totalAlerts: 0, totalCritical: 0 },
      generatedAt: new Date().toISOString()
    };

    // Handle different response structures
    if (Array.isArray(data)) {
      // Response is direct array
      if (data.length > 0 && data[0].vessels) {
        // First item contains our PCS data
        normalizedData = { ...normalizedData, ...data[0] };
      }
    } else if (data && typeof data === 'object') {
      if (data.vessels) {
        // Response contains vessels directly
        normalizedData = { ...normalizedData, ...data };
      } else if (data.data && data.data.vessels) {
        // Response wrapped in data object
        normalizedData = { ...normalizedData, ...data.data };
      } else if (data.items && Array.isArray(data.items)) {
        // Response in items array
        normalizedData.vessels = data.items;
      }
    }

    // Ensure we have valid arrays
    normalizedData.vessels = Array.isArray(normalizedData.vessels) ? normalizedData.vessels : [];
    normalizedData.alerts = Array.isArray(normalizedData.alerts) ? normalizedData.alerts : [];
    
    return normalizedData;
  }

  /**
   * Get cached data info
   */
  getCacheInfo() {
    return {
      lastFetch: this.lastFetch,
      hasData: !!this.lastResponse,
      vesselsCount: this.lastResponse?.vessels.length || 0,
      alertsCount: this.lastResponse?.alerts.length || 0,
    };
  }

  /**
   * Get vessel by ID
   */
  getVesselById(vesselId: string): Vessel | null {
    if (!this.lastResponse) return null;
    return this.lastResponse.vessels.find(v => v.vessel_id === vesselId) || null;
  }

  /**
   * Get alerts for vessel
   */
  getVesselAlerts(vesselId: string): Alert[] {
    if (!this.lastResponse) return [];
    return this.lastResponse.alerts.filter(a => a.vessel_id === vesselId);
  }
}

// Export singleton instance
export const pcsApi = new PcsApiClient();

// Field mapping for auto-discovery
export const FIELD_ALIASES = {
  id: ['id', '_id', 'uuid', 'vessel_id', 'identificadorNavio'],
  title: ['title', 'nome', 'name', 'descricao', 'summary', 'nomeNavio'],
  status: ['status', 'state', 'situacao', 'statusResumo'],
  updatedAt: ['updatedAt', 'updated_at', 'modificadoEm', 'data', 'timestamp', 'generatedAt'],
  source: ['source', 'origem', 'canal', 'fonte'],
  priority: ['priority', 'severity', 'prioridade'],
  events: ['events', 'history', 'historico', 'timeline', 'alerts'],
};

/**
 * Extract field value using aliases
 */
export function extractField(obj: any, fieldType: keyof typeof FIELD_ALIASES): any {
  const aliases = FIELD_ALIASES[fieldType];
  for (const alias of aliases) {
    if (obj && typeof obj === 'object' && obj[alias] !== undefined) {
      return obj[alias];
    }
  }
  return null;
}

/**
 * Get display name for status
 */
export function getStatusDisplay(status: string): { label: string; variant: string } {
  const statusMap: Record<string, { label: string; variant: string }> = {
    ok: { label: 'OK', variant: 'success' },
    bloqueado: { label: 'Bloqueado', variant: 'destructive' },
    bloqueado_documento: { label: 'Doc. Pendente', variant: 'warning' },
    pendente_autorizacao: { label: 'Aguardando', variant: 'pending' },
    conflito_horarios: { label: 'Conflito Horários', variant: 'warning' },
    aguardando_navio: { label: 'Aguardando Navio', variant: 'waiting' },
    autorizado: { label: 'Autorizado', variant: 'success' },
    pendente: { label: 'Pendente', variant: 'pending' },
    realizada: { label: 'Realizada', variant: 'success' },
    concluida: { label: 'Concluída', variant: 'success' },
    cancelada: { label: 'Cancelada', variant: 'destructive' },
    negado: { label: 'Negado', variant: 'destructive' },
  };

  return statusMap[status] || { label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), variant: 'secondary' };
}

/**
 * Parse alert summary string into counts object
 * Example: "DataMismatch: 7 · BloqueioDocumental: 5 · AcessoPendente: 2"
 */
export function parseAlertSummary(summaryText: string): Record<string, number> {
  if (!summaryText || typeof summaryText !== 'string') return {};
  
  const counts: Record<string, number> = {};
  const entries = summaryText.split('·').map(s => s.trim());
  
  entries.forEach(entry => {
    const match = entry.match(/^(.+?):\s*(\d+)$/);
    if (match) {
      const [, label, count] = match;
      counts[label.trim()] = parseInt(count, 10);
    }
  });
  
  return counts;
}