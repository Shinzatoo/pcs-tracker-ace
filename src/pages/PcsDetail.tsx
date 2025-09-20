import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Copy,
  ExternalLink,
  Calendar,
  MapPin,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Ship,
  Anchor,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { useVesselById, useVesselAlerts } from "@/hooks/usePcsData";
import { useFavorites } from "@/hooks/useFavorites";
import { getStatusDisplay, Alert } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PcsDetail() {
  const { vesselId } = useParams<{ vesselId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: vessel, isLoading: vesselLoading, error: vesselError } = useVesselById(vesselId!);
  const { data: alerts } = useVesselAlerts(vesselId!);

  if (!vesselId) {
    navigate("/pcs");
    return null;
  }

  if (vesselError) {
    return (
      <div className="container mx-auto py-8">
        <EmptyState
          variant="error"
          title="Embarque não encontrado"
          description="O embarque solicitado não foi encontrado no sistema."
          action={{
            label: "Voltar à lista",
            onClick: () => navigate("/pcs"),
          }}
        />
      </div>
    );
  }

  if (vesselLoading || !vessel) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { label: statusLabel, variant: statusVariant } = getStatusDisplay(vessel.statusResumo);

  const handleCopyId = () => {
    navigator.clipboard.writeText(vessel.vessel_id);
    toast({
      title: "ID copiado!",
      description: `ID ${vessel.vessel_id} copiado para a área de transferência`,
    });
  };

  const handleToggleFavorite = () => {
    toggleFavorite(vessel);
    toast({
      title: isFavorite(vessel.vessel_id) 
        ? "Removido dos favoritos" 
        : "Adicionado aos favoritos",
      description: `Navio ${vessel.vessel_id}`,
    });
  };

  // Timeline events from different sources
  const timelineEvents = [
    ...(vessel.agency ? [{
      type: "agency" as const,
      title: "Documentação da Agência",
      status: vessel.agency.statusDocumentacao || "pendente",
      date: vessel.agency.dataEnvioInformacoes,
      details: {
        "Agência": vessel.agency.nomeAgencia,
        "Manifesto Entregue": vessel.agency.manifestoEntregue ? "Sim" : "Não",
        "Status Documentação": vessel.agency.statusDocumentacao,
      }
    }] : []),
    
    ...(vessel.authority ? [{
      type: "authority" as const,
      title: "Autorização Portuária",
      status: vessel.authority.status || "pendente",
      date: vessel.authority.dataAutorizacao || vessel.authority.dataSolicitacao,
      details: {
        "Tipo Movimentação": vessel.authority.tipoMovimentacao,
        "Data Solicitação": vessel.authority.dataSolicitacao,
        "Data Autorização": vessel.authority.dataAutorizacao,
        "Status": vessel.authority.status,
        "Motivo": vessel.authority.motivo,
      }
    }] : []),
    
    ...(vessel.pilotage ? [{
      type: "pilotage" as const,
      title: "Praticagem",
      status: vessel.pilotage.status || "pendente",
      date: vessel.pilotage.dataExecucao || vessel.pilotage.dataSolicitacao,
      details: {
        "Tipo Manobra": vessel.pilotage.tipo,
        "Data Solicitação": vessel.pilotage.dataSolicitacao,
        "Data Execução": vessel.pilotage.dataExecucao,
        "Status": vessel.pilotage.status,
      }
    }] : []),
    
    ...(vessel.terminal ? [{
      type: "terminal" as const,
      title: "Operação do Terminal",
      status: vessel.terminal.statusOperacao || "pendente",
      date: vessel.terminal.dataRealAtracacao || vessel.terminal.dataPrevistaAtracacao,
      details: {
        "Terminal": vessel.terminal.terminal,
        "Tipo Operação": vessel.terminal.tipoOperacao,
        "Data Prevista": vessel.terminal.dataPrevistaAtracacao,
        "Data Real": vessel.terminal.dataRealAtracacao,
        "Status": vessel.terminal.statusOperacao,
      }
    }] : []),
  ].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/pcs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Anchor className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">
                Navio {vessel.vessel_id}
              </h1>
              <StatusBadge variant={statusVariant as any} indicator>
                {statusLabel}
              </StatusBadge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Detalhes completos da operação portuária</span>
              {alerts && alerts.length > 0 && (
                <Badge variant="destructive">
                  {alerts.length} alerta{alerts.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar ID
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleToggleFavorite}>
            <Star className={cn(
              "mr-2 h-4 w-4",
              isFavorite(vessel.vessel_id) && "fill-yellow-500 text-yellow-500"
            )} />
            {isFavorite(vessel.vessel_id) ? "Favoritado" : "Favoritar"}
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas Ativos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert: Alert, index) => (
                <div key={index} className="border-l-2 border-destructive pl-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {alert.type.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <Badge variant="destructive">{alert.type}</Badge>
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
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Following specified order: Barco -> Documentação -> Autoridade -> Praticagem -> Terminal */}
        <TabsContent value="overview" className="space-y-6">
          {/* 1. Barco (Main Vessel Info) */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ship className="h-5 w-5 text-primary" />
                <span>Informações do Navio</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID do Navio</label>
                  <p className="text-lg font-bold text-primary">{vessel.vessel_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status Geral</label>
                  <div className="mt-1">
                    <StatusBadge variant={statusVariant as any}>
                      {statusLabel}
                    </StatusBadge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
                  <p className="text-sm">{new Date().toLocaleString("pt-BR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* 2. Documentação (Agency) */}
            {vessel.agency && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span>Documentação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Agência</label>
                    <p className="text-sm font-medium">{vessel.agency.nomeAgencia || "—"}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status Documentação</label>
                    <div className="mt-1">
                      <StatusBadge size="sm" status={vessel.agency.statusDocumentacao}>
                        {vessel.agency.statusDocumentacao || "—"}
                      </StatusBadge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Manifesto</label>
                    <p className="text-sm">{vessel.agency.manifestoEntregue ? "✓ Entregue" : "✗ Pendente"}</p>
                  </div>

                  {vessel.agency.dataEnvioInformacoes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Envio de Informações</label>
                      <p className="text-sm">{new Date(vessel.agency.dataEnvioInformacoes).toLocaleString("pt-BR")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 3. Autoridade Portuária */}
            {vessel.authority && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Autoridade Portuária</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <StatusBadge size="sm" status={vessel.authority.status}>
                        {vessel.authority.status || "—"}
                      </StatusBadge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo Movimentação</label>
                    <p className="text-sm">{vessel.authority.tipoMovimentacao || "—"}</p>
                  </div>

                  {vessel.authority.dataSolicitacao && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data Solicitação</label>
                      <p className="text-sm">{new Date(vessel.authority.dataSolicitacao).toLocaleString("pt-BR")}</p>
                    </div>
                  )}
                  
                  {vessel.authority.dataAutorizacao && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data Autorização</label>
                      <p className="text-sm">{new Date(vessel.authority.dataAutorizacao).toLocaleString("pt-BR")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 4. Praticagem */}
            {vessel.pilotage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Anchor className="h-5 w-5 text-purple-500" />
                    <span>Praticagem</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <StatusBadge size="sm" status={vessel.pilotage.status}>
                        {vessel.pilotage.status || "—"}
                      </StatusBadge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Manobra</label>
                    <p className="text-sm">{vessel.pilotage.tipo || "—"}</p>
                  </div>
                  
                  {vessel.pilotage.dataSolicitacao && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data Solicitação</label>
                      <p className="text-sm">{new Date(vessel.pilotage.dataSolicitacao).toLocaleString("pt-BR")}</p>
                    </div>
                  )}

                  {vessel.pilotage.dataExecucao && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data Execução</label>
                      <p className="text-sm">{new Date(vessel.pilotage.dataExecucao).toLocaleString("pt-BR")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 5. Terminal */}
            {vessel.terminal && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <span>Terminal Portuário</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Terminal</label>
                    <p className="text-sm font-medium">{vessel.terminal.terminal || "—"}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status Operação</label>
                    <div className="mt-1">
                      <StatusBadge size="sm" status={vessel.terminal.statusOperacao}>
                        {vessel.terminal.statusOperacao || "—"}
                      </StatusBadge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo Operação</label>
                    <p className="text-sm">{vessel.terminal.tipoOperacao || "—"}</p>
                  </div>

                  {vessel.terminal.dataPrevistaAtracacao && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Atracação Prevista</label>
                      <p className="text-sm">{new Date(vessel.terminal.dataPrevistaAtracacao).toLocaleString("pt-BR")}</p>
                    </div>
                  )}

                  {vessel.terminal.dataRealAtracacao && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Atracação Real</label>
                      <p className="text-sm">{new Date(vessel.terminal.dataRealAtracacao).toLocaleString("pt-BR")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Timeline de Eventos</span>
              </CardTitle>
              <CardDescription>
                Cronologia das operações e atualizações do navio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timelineEvents.length > 0 ? (
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-2",
                          event.type === "agency" && "border-blue-500 bg-blue-500/10",
                          event.type === "authority" && "border-green-500 bg-green-500/10",
                          event.type === "pilotage" && "border-purple-500 bg-purple-500/10",
                          event.type === "terminal" && "border-orange-500 bg-orange-500/10"
                        )}>
                          <Ship className="h-4 w-4" />
                        </div>
                        {index < timelineEvents.length - 1 && (
                          <div className="mt-2 h-8 w-0.5 bg-border" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.title}</h4>
                          <StatusBadge size="sm" status={event.status}>
                            {event.status}
                          </StatusBadge>
                        </div>
                        
                        {event.date && (
                          <p className="text-sm text-muted-foreground flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(event.date).toLocaleString("pt-BR")}</span>
                          </p>
                        )}
                        
                        <div className="grid gap-2 text-sm">
                          {Object.entries(event.details).map(([key, value]) => (
                            value && (
                              <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground">{key}:</span>
                                <span className="font-medium">{
                                  value.toString().includes('T') && value.toString().includes('Z') 
                                    ? new Date(value).toLocaleString("pt-BR")
                                    : value
                                }</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  variant="default"
                  size="sm"
                  title="Nenhum evento registrado"
                  description="Não há eventos disponíveis para este navio"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Agency Details */}
            {vessel.agency && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Agência</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    {Object.entries(vessel.agency).map(([key, value]) => (
                      value !== null && value !== undefined && (
                        <div key={key}>
                          <dt className="text-sm font-medium text-muted-foreground">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm">
                            {typeof value === 'boolean' 
                              ? (value ? 'Sim' : 'Não')
                              : typeof value === 'object'
                              ? JSON.stringify(value, null, 2)
                              : value?.toString() || '—'
                            }
                          </dd>
                        </div>
                      )
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* Authority Details */}
            {vessel.authority && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Autoridade</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    {Object.entries(vessel.authority).map(([key, value]) => (
                      value !== null && value !== undefined && (
                        <div key={key}>
                          <dt className="text-sm font-medium text-muted-foreground">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm">
                            {value?.toString().includes('T') && value?.toString().includes('Z')
                              ? new Date(value).toLocaleString("pt-BR")
                              : value?.toString() || '—'
                            }
                          </dd>
                        </div>
                      )
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* Pilotage Details */}
            {vessel.pilotage && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Praticagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    {Object.entries(vessel.pilotage).map(([key, value]) => (
                      value !== null && value !== undefined && (
                        <div key={key}>
                          <dt className="text-sm font-medium text-muted-foreground">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm">
                            {value?.toString().includes('T') && value?.toString().includes('Z')
                              ? new Date(value).toLocaleString("pt-BR")
                              : value?.toString() || '—'
                            }
                          </dd>
                        </div>
                      )
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}

            {/* Terminal Details */}
            {vessel.terminal && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Terminal</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    {Object.entries(vessel.terminal).map(([key, value]) => (
                      value !== null && value !== undefined && (
                        <div key={key}>
                          <dt className="text-sm font-medium text-muted-foreground">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm">
                            {value?.toString().includes('T') && value?.toString().includes('Z')
                              ? new Date(value).toLocaleString("pt-BR")
                              : value?.toString() || '—'
                            }
                          </dd>
                        </div>
                      )
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos e Anexos</CardTitle>
              <CardDescription>
                Documentação relacionada ao navio e suas operações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                variant="default"
                size="sm"
                icon={FileText}
                title="Funcionalidade em desenvolvimento"
                description="A visualização de documentos será implementada em breve"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}