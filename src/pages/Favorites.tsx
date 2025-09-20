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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
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
            <span>Embarques Favoritos</span>
          </h1>
          <p className="text-muted-foreground">
            Seus navios marcados para acompanhamento rápido
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {favorites.length} favorito{favorites.length !== 1 ? "s" : ""}
          </Badge>
          
          {favorites.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Todos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar todos os favoritos?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Todos os {favorites.length} navios favoritos serão removidos.
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      clearFavorites();
                      toast({
                        title: "Favoritos limpos",
                        description: "Todos os favoritos foram removidos",
                      });
                    }}
                  >
                    Limpar Todos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

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
    </div>
  );
}