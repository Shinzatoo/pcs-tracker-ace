import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import {
  Star,
  Trash2,
  ExternalLink,
  Copy,
  Heart,
  Ship,
  Notebook,
  Bot,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useFavorites, FavoriteVessel } from "@/hooks/useFavorites";
import { useFavoriteMessages } from "@/hooks/useFavoriteMessages";
import { usePcsData } from "@/hooks/usePcsData";
import { getStatusDisplay } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Favorites() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    favorites, 
    removeFavorite, 
    clearFavorites, 
    loading: favoritesLoading 
  } = useFavorites();
  
  const { 
    favoriteMessages, 
    removeFavoriteMessage, 
    favoritesCount: messagesFavoritesCount 
  } = useFavoriteMessages();

  // Fetch current data to get latest vessel info
  const { data: pcsData } = usePcsData();

  // Enrich favorites with current vessel data
  interface EnrichedFavorite extends FavoriteVessel {
    currentStatus?: string;
    isOnline: boolean;
    vessel?: any;
  }

  const enrichedFavorites = useMemo((): EnrichedFavorite[] => {
    if (!pcsData) return favorites.map(f => ({ ...f, isOnline: false }));
    
    return favorites.map(favorite => {
      const currentVessel = pcsData.vessels.find(v => v.vessel_id === favorite.vessel_id);
      
      return {
        ...favorite,
        currentStatus: currentVessel?.statusResumo,
        isOnline: !!currentVessel,
        vessel: currentVessel,
      };
    });
  }, [favorites, pcsData]);

  const columns: ColumnDef<EnrichedFavorite>[] = [
    {
      accessorKey: "vessel_id",
      header: "ID do Navio",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span className="font-mono text-sm font-medium">{row.getValue("vessel_id")}</span>
          {!row.original.isOnline && (
            <Badge variant="outline" className="text-xs">
              Offline
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "currentStatus",
      header: "Status Atual",
      cell: ({ row }) => {
        const currentStatus = row.getValue("currentStatus") as string;
        const savedStatus = row.original.status;
        
        if (currentStatus) {
          const { label, variant } = getStatusDisplay(currentStatus);
          return (
            <div className="flex items-center space-x-2">
              <StatusBadge variant={variant as any} size="sm">
                {label}
              </StatusBadge>
              {currentStatus !== savedStatus && (
                <Badge variant="outline" className="text-xs">
                  Atualizado
                </Badge>
              )}
            </div>
          );
        } else {
          // Show saved status if vessel is offline
          const { label, variant } = getStatusDisplay(savedStatus);
          return (
            <StatusBadge variant="secondary" size="sm">
              {label} (Salvo)
            </StatusBadge>
          );
        }
      },
    },
    {
      accessorKey: "source",
      header: "Origem",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("source") || "—"}</span>
      ),
    },
    {
      accessorKey: "addedAt",
      header: "Adicionado",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.getValue("addedAt")).toLocaleDateString("pt-BR")}
        </span>
      ),
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover dos favoritos?</AlertDialogTitle>
                <AlertDialogDescription>
                  O navio {row.original.vessel_id} será removido da sua lista de favoritos.
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    removeFavorite(row.original.vessel_id);
                    toast({
                      title: "Removido dos favoritos",
                      description: `Navio ${row.original.vessel_id} removido`,
                    });
                  }}
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
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

  const handleRowClick = (favorite: EnrichedFavorite) => {
    navigate(`/pcs/${favorite.vessel_id}`);
  };

  if (favoritesLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Heart className="h-7 w-7 text-red-500" />
            <span>Favoritos</span>
          </h1>
          <p className="text-muted-foreground">
            Seus navios e mensagens favoritas
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm flex items-center space-x-1">
            <span>📄</span>
            <span>{favorites.length}</span>
          </Badge>
          <Badge variant="outline" className="text-sm flex items-center space-x-1">
            <span>📝</span>
            <span>{messagesFavoritesCount}</span>
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="vessels" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vessels" className="flex items-center space-x-2">
            <Ship className="h-4 w-4" />
            <span>Navios Favoritos</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <Notebook className="h-4 w-4" />
            <span>Notepad de Mensagens</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vessels" className="space-y-6">
          {/* Status Summary */}
          {enrichedFavorites.length > 0 && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Online</p>
                      <p className="text-2xl font-bold">
                        {enrichedFavorites.filter(f => f.isOnline).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Offline</p>
                      <p className="text-2xl font-bold">
                        {enrichedFavorites.filter(f => !f.isOnline).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium">Status OK</p>
                      <p className="text-2xl font-bold">
                        {enrichedFavorites.filter(f => f.currentStatus === 'ok').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div>
                      <p className="text-sm font-medium">Com Alertas</p>
                      <p className="text-2xl font-bold">
                        {enrichedFavorites.filter(f => 
                          f.currentStatus && !f.currentStatus.includes('ok')
                        ).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Favorites Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Favoritos</CardTitle>
              <CardDescription>
                Clique em uma linha para ver detalhes do navio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrichedFavorites.length === 0 ? (
                <EmptyState
                  variant="default"
                  title="Nenhum favorito ainda"
                  description="Comece adicionando navios aos seus favoritos na lista de embarques para acompanhamento rápido."
                  action={{
                    label: "Explorar Embarques",
                    onClick: () => navigate("/pcs"),
                  }}
                />
              ) : (
                <DataTable
                  columns={columns}
                  data={enrichedFavorites}
                  searchPlaceholder="Buscar favoritos..."
                  searchColumn="vessel_id"
                  onRowClick={handleRowClick}
                  emptyMessage="Nenhum favorito encontrado"
                  enableRowSelection={false}
                />
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {favorites.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Como usar os favoritos</CardTitle>
                <CardDescription>
                  Marque navios como favoritos para acompanhamento rápido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <span className="text-sm">Vá para a lista de embarques</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-8">
                      Navegue pelos navios disponíveis no sistema
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <span className="text-sm">Clique na estrela ao lado do ID</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-8">
                      Marque os navios que deseja acompanhar
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button asChild>
                    <Link to="/pcs" className="flex items-center">
                      <Ship className="mr-2 h-4 w-4" />
                      Ver Todos os Embarques
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Notebook className="h-5 w-5" />
                <span>Notepad de Mensagens</span>
              </CardTitle>
              <CardDescription>
                Suas mensagens favoritas do Agente Marítimo IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteMessages.length === 0 ? (
                <EmptyState
                  variant="default"
                  title="Nenhuma mensagem favorita"
                  description="Favorite mensagens importantes do Agente Marítimo IA clicando no coração ao lado das mensagens."
                  action={{
                    label: "Ir para o Agente IA",
                    onClick: () => navigate("/agente"),
                  }}
                />
              ) : (
                <ScrollArea className="h-[600px] w-full">
                  <div className="space-y-4">
                    {favoriteMessages.map((message, index) => (
                      <div key={message.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                              message.isUser 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              {message.isUser ? (
                                <User className="h-3 w-3" />
                              ) : (
                                <Bot className="h-3 w-3" />
                              )}
                            </div>
                            <span className="text-sm font-medium">
                              {message.isUser ? 'Você' : 'Agente IA'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover mensagem?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta mensagem será removida dos seus favoritos.
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    removeFavoriteMessage(message.id);
                                    toast({
                                      title: "Mensagem removida",
                                      description: "A mensagem foi removida dos favoritos",
                                    });
                                  }}
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                        {index < favoriteMessages.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}