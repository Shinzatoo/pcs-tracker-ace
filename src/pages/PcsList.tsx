import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import {
  Ship,
  Star,
  ExternalLink,
  Copy,
  Filter,
  Search,
  Calendar,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { usePcsData } from "@/hooks/usePcsData";
import { useFavorites } from "@/hooks/useFavorites";
import { Vessel, getStatusDisplay } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PcsFilters {
  status: string;
  source: string;
  search: string;
  alert?: string; // New filter for alert type
}

export default function PcsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [filters, setFilters] = useState<PcsFilters>({
    status: "all",
    source: "all",
    search: "",
    alert: new URLSearchParams(window.location.search).get('alert') || undefined,
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data with filters
  const { data, isLoading, error } = usePcsData({
    filters: {
      status: filters.status !== "all" ? filters.status : undefined,
      search: filters.search || undefined,
    },
  });

  // Filter data client-side for additional filters
  const filteredVessels = useMemo(() => {
    if (!data) return [];
    
    return data.vessels.filter(vessel => {
      // Source filter
      if (filters.source !== "all") {
        const hasSource = vessel.agency?.nomeAgencia?.toLowerCase().includes(filters.source.toLowerCase()) ||
                          vessel.terminal?.terminal?.toLowerCase().includes(filters.source.toLowerCase()) ||
                          vessel.authority?.status?.toLowerCase().includes(filters.source.toLowerCase());
        if (!hasSource) return false;
      }
      
      // Search filter (client-side for more comprehensive search)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableText = [
          vessel.vessel_id,
          vessel.statusResumo,
          vessel.agency?.nomeAgencia,
          vessel.terminal?.terminal,
          vessel.authority?.tipoMovimentacao,
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) return false;
      }
      
      // Alert filter - check if vessel has alerts of specific type
      if (filters.alert && data.alerts) {
        const vesselAlerts = data.alerts.filter(alert => alert.vessel_id === vessel.vessel_id);
        const hasMatchingAlert = vesselAlerts.some(alert => alert.type === filters.alert);
        if (!hasMatchingAlert) return false;
      }
      
      return true;
    });
  }, [data, filters]);

  // Get unique sources for filter dropdown
  const availableSources = useMemo(() => {
    if (!data) return [];
    
    const sources = new Set<string>();
    data.vessels.forEach(vessel => {
      if (vessel.agency?.nomeAgencia) sources.add(vessel.agency.nomeAgencia);
      if (vessel.terminal?.terminal) sources.add(vessel.terminal.terminal);
    });
    
    return Array.from(sources).sort();
  }, [data]);

  // Table columns definition
  const columns: ColumnDef<Vessel>[] = [
    {
      accessorKey: "vessel_id",
      header: "ID do Navio",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(row.original);
              toast({
                title: isFavorite(row.original.vessel_id) 
                  ? "Removido dos favoritos" 
                  : "Adicionado aos favoritos",
                description: `Navio ${row.original.vessel_id}`,
              });
            }}
            className="p-1 h-auto"
          >
            <Star className={cn(
              "h-4 w-4",
              isFavorite(row.original.vessel_id) 
                ? "fill-yellow-500 text-yellow-500" 
                : "text-muted-foreground"
            )} />
          </Button>
          <span className="font-mono text-sm">{row.getValue("vessel_id")}</span>
        </div>
      ),
    },
    {
      accessorKey: "statusResumo",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("statusResumo") as string;
        const { label, variant } = getStatusDisplay(status);
        return (
          <StatusBadge variant={variant as any} indicator>
            {label}
          </StatusBadge>
        );
      },
    },
    {
      id: "agency",
      header: "Agência",
      cell: ({ row }) => {
        const agency = row.original.agency;
        return agency ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">{agency.nomeAgencia || "—"}</div>
            {agency.statusDocumentacao && (
              <StatusBadge size="sm" status={agency.statusDocumentacao}>
                {agency.statusDocumentacao}
              </StatusBadge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      id: "terminal",
      header: "Terminal",
      cell: ({ row }) => {
        const terminal = row.original.terminal;
        return terminal ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">{terminal.terminal || "—"}</div>
            {terminal.statusOperacao && (
              <StatusBadge size="sm" status={terminal.statusOperacao}>
                {terminal.statusOperacao}
              </StatusBadge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      id: "dates",
      header: "Datas Importantes",
      cell: ({ row }) => {
        const vessel = row.original;
        const dates = [];
        
        if (vessel.authority?.dataAutorizacao) {
          dates.push({
            label: "Autorização",
            date: vessel.authority.dataAutorizacao,
          });
        }
        
        if (vessel.pilotage?.dataExecucao) {
          dates.push({
            label: "Execução",
            date: vessel.pilotage.dataExecucao,
          });
        }
        
        if (vessel.terminal?.dataPrevistaAtracacao) {
          dates.push({
            label: "Prev. Atracação",
            date: vessel.terminal.dataPrevistaAtracacao,
          });
        }

        return dates.length > 0 ? (
          <div className="space-y-1 text-xs">
            {dates.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-muted-foreground">{item.label}:</span>
                <span>{new Date(item.date).toLocaleDateString("pt-BR")}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(row.original.vessel_id);
              toast({
                title: "ID copiado!",
                description: `ID ${row.original.vessel_id} copiado para a área de transferência`,
              });
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/pcs/${row.original.vessel_id}`);
            }}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const handleRowClick = (vessel: Vessel) => {
    navigate(`/pcs/${vessel.vessel_id}`);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <EmptyState
          variant="error"
          title="Erro ao carregar embarques"
          description="Não foi possível conectar ao sistema PCS. Verifique sua conexão."
          action={{
            label: "Tentar novamente",
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Embarques PCS</h1>
          <p className="text-muted-foreground">
            Lista completa de navios e suas operações portuárias
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {data && (
            <Badge variant="outline" className="text-sm">
              {filteredVessels.length} de {data.vessels.length} embarques
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtros Avançados</span>
                {(filters.status !== "all" || filters.source !== "all" || filters.search || filters.alert) && (
                  <Badge variant="secondary">Ativos</Badge>
                )}
                {filters.alert && (
                  <Badge variant="destructive">
                    Filtrando: {filters.alert.replace(/([A-Z])/g, ' $1').trim()}
                  </Badge>
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>Busca Livre</span>
                  </label>
                  <Input
                    placeholder="ID do navio, agência..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Ship className="h-4 w-4" />
                    <span>Status</span>
                  </label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="ok">OK</SelectItem>
                      <SelectItem value="bloqueado">Bloqueado</SelectItem>
                      <SelectItem value="pendente_autorizacao">Pendente</SelectItem>
                      <SelectItem value="conflito_horarios">Conflito</SelectItem>
                      <SelectItem value="aguardando_navio">Aguardando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Source Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Origem</span>
                  </label>
                  <Select
                    value={filters.source}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as origens</SelectItem>
                      {availableSources.map(source => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters */}
              {(filters.status !== "all" || filters.source !== "all" || filters.search || filters.alert) && (
                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({ status: "all", source: "all", search: "", alert: undefined });
                      // Update URL to remove alert parameter
                      const url = new URL(window.location.href);
                      url.searchParams.delete('alert');
                      window.history.pushState({}, '', url.toString());
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Embarques</CardTitle>
          <CardDescription>
            Clique em uma linha para ver detalhes completos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVessels.length === 0 && !isLoading ? (
            <EmptyState
              variant="search"
              title="Nenhum embarque encontrado"
              description="Tente ajustar os filtros ou verificar se há dados disponíveis no sistema."
              action={{
                label: "Limpar filtros",
                onClick: () => setFilters({ status: "all", source: "all", search: "" }),
              }}
            />
          ) : (
            <DataTable
              columns={columns}
              data={filteredVessels}
              searchPlaceholder="Buscar embarques..."
              searchColumn="vessel_id"
              onRowClick={handleRowClick}
              loading={isLoading}
              emptyMessage="Nenhum embarque disponível"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}