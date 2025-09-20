import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { usePcsData } from "@/hooks/usePcsData";
import { Skeleton } from "@/components/ui/skeleton";

import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExecutiveSummary {
  documentalBlocks: number;
  accessIssues: number;
  timeDiscrepancies: number;
  totalIssues: number;
  recommendations: string[];
  summary: string;
}

function generateExecutiveSummary(alerts: any[]): ExecutiveSummary {
  let documentalBlocks = 0;
  let accessIssues = 0;
  let timeDiscrepancies = 0;
  
  alerts.forEach(alert => {
    const type = alert.tipo || alert.type || '';
    const description = alert.descricao || alert.description || '';
    
    // Bloqueios documentais
    if (type.includes('BloqueioDocumental') || description.includes('documentação') || description.includes('documento')) {
      documentalBlocks++;
    }
    
    // Acessos pendentes/negados
    if (type.includes('AcessoPendente') || type.includes('AcessoNegado') || description.includes('acesso')) {
      accessIssues++;
    }
    
    // Divergências de horário
    if (type.includes('DataMismatch') || description.includes('horário') || description.includes('tempo')) {
      timeDiscrepancies++;
    }
  });
  
  const totalIssues = documentalBlocks + accessIssues + timeDiscrepancies;
  
  const recommendations = [];
  if (documentalBlocks > 0) {
    recommendations.push("Priorizar regularização de documentos pendentes");
  }
  if (accessIssues > 0) {
    recommendations.push("Revisar processos de autorização portuária");
  }
  if (timeDiscrepancies > 0) {
    recommendations.push("Sincronizar cronogramas entre autoridades");
  }
  
  // Gerar resumo em até 6 linhas
  let summary = `RESUMO EXECUTIVO - ${new Date().toLocaleDateString('pt-BR')}\n\n`;
  
  if (totalIssues === 0) {
    summary += "✅ Operações portuárias funcionando normalmente.\n";
    summary += "📊 Nenhum bloqueio crítico identificado.\n";
    summary += "🎯 Manter monitoramento contínuo das operações.";
  } else {
    summary += `🚨 ${totalIssues} problemas críticos identificados:\n`;
    if (documentalBlocks > 0) summary += `📋 ${documentalBlocks} bloqueios documentais ativos\n`;
    if (accessIssues > 0) summary += `🔐 ${accessIssues} questões de acesso/autorização\n`;
    if (timeDiscrepancies > 0) summary += `⏰ ${timeDiscrepancies} divergências de cronograma\n`;
    if (recommendations.length > 0) {
      summary += `💡 Ações recomendadas: ${recommendations.slice(0, 2).join('; ')}.`;
    }
  }
  
  return {
    documentalBlocks,
    accessIssues,
    timeDiscrepancies,
    totalIssues,
    recommendations,
    summary
  };
}

export default function Reports() {
  const { data, isLoading, error, refetch } = usePcsData();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-card shadow-vessel">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground mb-4">Não foi possível gerar o relatório. Tente novamente.</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const alerts = data?.alerts || [];
  const executiveSummary = generateExecutiveSummary(alerts);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-2">
            Resumo executivo das operações portuárias
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Executive Summary */}
      <Card className="bg-gradient-card shadow-vessel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metrics */}
            <div className="lg:col-span-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-destructive">
                    {executiveSummary.documentalBlocks}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Bloqueios Documentais
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-warning">
                    {executiveSummary.accessIssues}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Questões de Acesso
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-info">
                    {executiveSummary.timeDiscrepancies}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Divergências Horário
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="text-2xl font-bold text-primary">
                    {executiveSummary.totalIssues}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total de Problemas
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Text */}
            <div className="lg:col-span-2">
              <Alert className={executiveSummary.totalIssues === 0 ? "border-success" : "border-warning"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                    {executiveSummary.summary}
                  </pre>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {executiveSummary.recommendations.length > 0 && (
        <Card className="bg-gradient-card shadow-vessel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {executiveSummary.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-vessel">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{alerts.length}</div>
            <div className="text-sm text-muted-foreground">Total de Alertas</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-vessel">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <div className="text-2xl font-bold">{executiveSummary.documentalBlocks}</div>
            <div className="text-sm text-muted-foreground">Bloqueios</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-vessel">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">{executiveSummary.timeDiscrepancies}</div>
            <div className="text-sm text-muted-foreground">Divergências</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-vessel">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold">{executiveSummary.recommendations.length}</div>
            <div className="text-sm text-muted-foreground">Recomendações</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}