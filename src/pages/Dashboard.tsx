import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Ship,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Activity,
  Users,
} from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { usePcsData } from "@/hooks/usePcsData";
import { getStatusDisplay } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data, isLoading, error, isRefetching } = usePcsData({
    refetchInterval: 60000, // Auto-refresh every minute
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!data) return null;

    const total = data.vessels.length;
    const byStatus = data.vessels.reduce((acc, vessel) => {
      const status = vessel.statusResumo;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const alerts = data.alerts.length;
    const criticalAlerts = data.alerts.filter(a => 
      a.type === "AcessoNegado" || a.type === "BloqueioDocumental"
    ).length;

    return {
      total,
      alerts,
      criticalAlerts,
      ok: byStatus['ok'] || 0,
      blocked: byStatus['bloqueado'] || 0,
      pending: byStatus['pendente_autorizacao'] || 0,
      sources: Object.keys(data.counts).length,
    };
  }, [data]);

  const recentAlerts = useMemo(() => {
    if (!data) return [];
    return data.alerts
      .sort((a, b) => a.type.localeCompare(b.type))
      .slice(0, 5);
  }, [data]);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <EmptyState
          variant="error"
          title="Erro ao carregar dados"
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
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard PCS</h1>
            <p className="text-muted-foreground">
              Monitoramento em tempo real do Port Control System
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isRefetching && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Activity className="mr-2 h-4 w-4 animate-pulse" />
                Atualizando...
              </div>
            )}
            {data?.generatedAt && (
              <div className="text-sm text-muted-foreground">
                Última atualização:{" "}
                {new Date(data.generatedAt).toLocaleString("pt-BR")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total de Embarques"
          value={kpis?.total || 0}
          subtitle="Navios no sistema"
          icon={Ship}
          variant="info"
          loading={isLoading}
        />
        
        <KpiCard
          title="Alertas Ativos"
          value={kpis?.alerts || 0}
          subtitle={`${kpis?.criticalAlerts || 0} críticos`}
          icon={AlertTriangle}
          variant={kpis && kpis.alerts > 0 ? "danger" : "success"}
          loading={isLoading}
        />
        
        <KpiCard
          title="Status OK"
          value={kpis?.ok || 0}
          subtitle="Operações normais"
          icon={CheckCircle}
          variant="success"
          loading={isLoading}
        />
        
        <KpiCard
          title="Fontes Ativas"
          value={kpis?.sources || 0}
          subtitle="APIs integradas"
          icon={Users}
          variant="default"
          loading={isLoading}
        />
      </div>

      {/* Status Overview & Recent Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>
              Visão geral dos status dos embarques
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {kpis && Object.entries({
                  ok: kpis.ok,
                  bloqueado: kpis.blocked,
                  pendente_autorizacao: kpis.pending,
                }).map(([status, count]) => {
                  const { label, variant } = getStatusDisplay(status);
                  const percentage = kpis.total > 0 ? (count / kpis.total * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <StatusBadge variant={variant as any} size="sm">
                          {label}
                        </StatusBadge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium">{count}</span>
                        <span className="text-muted-foreground">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas Recentes</CardTitle>
            <CardDescription>
              Intercorrências que requerem atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : recentAlerts.length > 0 ? (
              <div className="space-y-3">
                {recentAlerts.map((alert, index) => (
                  <div key={index} className="border-l-2 border-destructive pl-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {alert.type.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <StatusBadge variant="blocked" size="sm">
                        {alert.vessel_id}
                      </StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {alert.suggestion}
                    </p>
                  </div>
                ))}
                
                {data && data.alerts.length > 5 && (
                  <div className="pt-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/pcs" className="flex items-center">
                        Ver todos os alertas
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                variant="default"
                size="sm"
                icon={CheckCircle}
                title="Nenhum alerta"
                description="Todas as operações estão funcionando normalmente"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso direto às funcionalidades principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" asChild className="h-auto p-4 flex-col space-y-2">
              <Link to="/pcs">
                <Ship className="h-6 w-6" />
                <span>Ver Todos os Embarques</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4 flex-col space-y-2">
              <Link to="/favorites">
                <TrendingUp className="h-6 w-6" />
                <span>Embarques Favoritos</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Clock className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}