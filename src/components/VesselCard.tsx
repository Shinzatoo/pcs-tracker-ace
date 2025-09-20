import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Star,
  Ship,
  FileText,
  CheckCircle,
  Anchor,
  MapPin,
  Copy,
  ExternalLink,
  Clock,
  Calendar
} from "lucide-react";
import { Vessel, getStatusDisplay } from "@/lib/api";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VesselCardProps {
  vessel: Vessel;
}

export function VesselCard({ vessel }: VesselCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const { label: statusLabel, variant: statusVariant } = getStatusDisplay(vessel.statusResumo);

  const handleCopyId = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(vessel.vessel_id);
    toast({
      title: "ID copiado!",
      description: `ID ${vessel.vessel_id} copiado para a área de transferência`,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(vessel);
    toast({
      title: isFavorite(vessel.vessel_id) 
        ? "Removido dos favoritos" 
        : "Adicionado aos favoritos",
      description: `Navio ${vessel.vessel_id}`,
    });
  };

  return (
    <Link to={`/pcs/${vessel.vessel_id}`}>
      <Card className="bg-gradient-card shadow-vessel hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ship className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-lg">{vessel.vessel_id}</h3>
            </div>
            <div className="flex items-center space-x-1">
              <StatusBadge variant={statusVariant as any} size="sm">
                {statusLabel}
              </StatusBadge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star className={cn(
                  "h-4 w-4",
                  isFavorite(vessel.vessel_id) 
                    ? "fill-yellow-500 text-yellow-500" 
                    : "text-muted-foreground"
                )} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyId}
                className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          
          {vessel.agency?.nomeAgencia && (
            <p className="text-sm text-muted-foreground">
              {vessel.agency.nomeAgencia}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Documentação */}
          {vessel.agency && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Documentação</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                <StatusBadge size="sm" status={vessel.agency.statusDocumentacao}>
                  {vessel.agency.statusDocumentacao || "—"}
                </StatusBadge>
              </div>
            </div>
          )}

          {vessel.agency?.manifestoEntregue !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Manifesto:</span>
              <Badge variant={vessel.agency.manifestoEntregue ? "default" : "secondary"} className="text-xs">
                {vessel.agency.manifestoEntregue ? "Entregue" : "Pendente"}
              </Badge>
            </div>
          )}

          {/* Autoridade Portuária */}
          {vessel.authority && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Autoridade Portuária</span>
                </div>
              </div>
              
              <div className="ml-6 space-y-2">
                {vessel.authority.tipoMovimentacao && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Movimento:</span>
                    <Badge variant="outline" className="text-xs uppercase">
                      {vessel.authority.tipoMovimentacao}
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <StatusBadge size="sm" status={vessel.authority.status}>
                    {vessel.authority.status || "—"}
                  </StatusBadge>
                </div>
                
                {vessel.authority.dataAutorizacao && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Autorizado:</span>
                    <span className="text-xs font-mono">
                      {new Date(vessel.authority.dataAutorizacao).toLocaleString("pt-BR").slice(0, -3)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Praticagem */}
          {vessel.pilotage && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Anchor className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Praticagem</span>
                </div>
              </div>
              
              <div className="ml-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <StatusBadge size="sm" status={vessel.pilotage.status}>
                    {vessel.pilotage.status || "—"}
                  </StatusBadge>
                </div>
                
                {vessel.pilotage.dataExecucao && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Executado:</span>
                    <span className="text-xs font-mono">
                      {new Date(vessel.pilotage.dataExecucao).toLocaleString("pt-BR").slice(0, -3)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Terminal */}
          {vessel.terminal && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Terminal</span>
                </div>
              </div>
              
              <div className="ml-6 space-y-2">
                {vessel.terminal.terminal && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Local:</span>
                    <span className="text-xs font-medium">{vessel.terminal.terminal}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Operação:</span>
                  <StatusBadge size="sm" status={vessel.terminal.statusOperacao}>
                    {vessel.terminal.statusOperacao || "—"}
                  </StatusBadge>
                </div>
                
                {vessel.terminal.dataPrevistaAtracacao && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Previsto:</span>
                    <span className="text-xs font-mono">
                      {new Date(vessel.terminal.dataPrevistaAtracacao).toLocaleString("pt-BR").slice(0, -3)}
                    </span>
                  </div>
                )}
                
                {vessel.terminal.dataRealAtracacao && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Real:</span>
                    <span className="text-xs font-mono">
                      {new Date(vessel.terminal.dataRealAtracacao).toLocaleString("pt-BR").slice(0, -3)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}