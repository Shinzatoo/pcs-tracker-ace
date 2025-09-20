import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Ship,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { VesselCard } from "@/components/VesselCard";
import { StatusOverview } from "@/components/StatusOverview";
import { useToast } from "@/hooks/use-toast";
import { usePcsData, usePcsRefresh } from "@/hooks/usePcsData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PcsFilters {
  status: string;
  alert?: string;
}

export default function PcsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { refresh } = usePcsRefresh();
  
  const [filters, setFilters] = useState<PcsFilters>({
    status: "all",
    alert: searchParams.get('alert') || undefined,
  });

  // Update filters when URL changes
  useEffect(() => {
    const alertParam = searchParams.get('alert');
    if (alertParam !== filters.alert) {
      setFilters(prev => ({ ...prev, alert: alertParam || undefined }));
    }
  }, [searchParams, filters.alert]);

  // Fetch data with filters
  const { data, isLoading, error } = usePcsData({
    filters: {
      status: filters.status !== "all" ? filters.status : undefined,
    },
  });

  // Filter data client-side for additional filters
  const filteredVessels = useMemo(() => {
    if (!data) return [];
    
    return data.vessels.filter(vessel => {
      // Status filter
      if (filters.status !== "all") {
        if (filters.status === "operational") {
          return vessel.statusResumo.includes('conflito_horarios') || 
                 (vessel.authority?.status === 'autorizado' && vessel.pilotage?.status === 'realizada');
        }
        if (filters.status === "blocked") {
          return vessel.statusResumo.includes('bloqueado');
        }
        if (filters.status === "pending") {
          return vessel.authority?.status === 'pendente' || vessel.pilotage?.status === 'pendente';
        }
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

  const handleRefresh = async () => {
    refresh();
    toast({
      title: "Dados atualizados",
      description: "Informações do porto foram atualizadas com sucesso.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Carregando dados do porto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md bg-destructive/5 border-destructive/20">
              <CardContent className="pt-6 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Erro ao Carregar Dados</h3>
                <p className="text-muted-foreground mb-4">
                  Não foi possível conectar ao sistema PCS. Verifique sua conexão.
                </p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
              Centro de Controle Portuário
            </h1>
            <p className="text-muted-foreground mt-2">
              Lista completa de navios e suas operações portuárias
            </p>
            {data?.generatedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Última atualização: {format(new Date(data.generatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            {data && (
              <Badge variant="outline" className="text-sm">
                {filteredVessels.length} de {data.vessels.length} embarques
              </Badge>
            )}
          </div>
        </div>

        {/* Status Overview */}
        {data?.alerts && data.alerts.length > 0 && (
          <Card className="bg-gradient-card shadow-vessel">
            <CardHeader>
              <CardTitle>Visão Geral dos Status dos Embarques</CardTitle>
              <CardDescription>
                Agregação por categoria de impedimento/estado operacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatusOverview alerts={data.alerts} />
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="vessels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto">
            <TabsTrigger value="vessels" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Embarcações ({data?.vessels.length || 0})
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas ({data?.alerts.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vessels" className="space-y-6">
            {/* Vessel Filter */}
            <Card className="bg-gradient-card shadow-vessel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros de Embarcação
                  {filters.alert && (
                    <Badge variant="destructive" className="ml-2">
                      Alerta: {filters.alert.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.status === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, status: "all" }))}
                  >
                    Todas ({data?.vessels.length || 0})
                  </Button>
                  <Button
                    variant={filters.status === "operational" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, status: "operational" }))}
                  >
                    Operacionais
                  </Button>
                  <Button
                    variant={filters.status === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, status: "pending" }))}
                  >
                    Pendentes
                  </Button>
                  <Button
                    variant={filters.status === "blocked" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, status: "blocked" }))}
                  >
                    Bloqueadas
                  </Button>
                  {filters.alert && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, alert: undefined }));
                        navigate('/pcs', { replace: true });
                      }}
                    >
                      ✕ Limpar Filtro de Alerta
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vessels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVessels.map((vessel) => (
                <VesselCard key={vessel.vessel_id} vessel={vessel} />
              ))}
            </div>

            {filteredVessels.length === 0 && (
              <Card className="bg-gradient-card shadow-vessel">
                <CardContent className="pt-6 text-center">
                  <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma embarcação encontrada com os filtros selecionados.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-gradient-card shadow-vessel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Central de Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.alerts && data.alerts.length > 0 ? (
                  <div className="space-y-4">
                    {data.alerts.map((alert, index) => (
                      <div key={index} className="border-l-2 border-destructive pl-4 space-y-2 py-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {alert.type.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{alert.vessel_id}</Badge>
                            <Badge variant="destructive">{alert.type}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.suggestion}
                        </p>
                        {alert.reason && (
                          <p className="text-sm">
                            <span className="font-medium">Motivo:</span> {alert.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum alerta ativo no momento.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}