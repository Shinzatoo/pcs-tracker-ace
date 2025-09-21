import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Ship,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Activity,
  Users,
} from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusOverview } from "@/components/StatusOverview";
import { CategoriesOverview } from "@/components/CategoriesOverview";
import { usePcsData } from "@/hooks/usePcsData";

export default function Dashboard() {
  const { data, isLoading, error, isRefetching } = usePcsData({
    // Manual refresh only - no auto-refresh
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!data) return null;

    const total = data.kpis?.totalVessels || data.vessels.length;
    const alerts = data.kpis?.totalAlerts || data.alerts.length;
    const criticalAlerts = data.kpis?.totalCritical || data.alerts.filter(a => 
      a.type === "AcessoNegado" || a.type === "BloqueioDocumental"
    ).length;

    // Get "Operação normal" count from categories
    const operacaoNormal = data.categories?.["Operação normal"]?.count || 0;

    return {
      total,
      alerts,
      criticalAlerts,
      operacaoNormal,
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
          title="Operação Normal"
          value={kpis?.operacaoNormal || 0}
          subtitle="Navios sem impedimentos"
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
        {/* Status Overview from Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral dos Status dos Embarques</CardTitle>
            <CardDescription>
              Agregação por categoria de impedimento/estado operacional
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : data?.categories && Object.keys(data.categories).length > 0 ? (
              <CategoriesOverview categories={data.categories} />
            ) : (
              <div className="text-center text-muted-foreground py-6">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
                <p>Categorias indisponíveis neste snapshot</p>
                <p className="text-xs">Aguarde nova coleta de dados</p>
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

    </div>
  );
}