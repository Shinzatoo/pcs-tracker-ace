import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Anchor, 
  Bell, 
  RefreshCw, 
  Settings, 
  Star,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePcsRefresh } from "@/hooks/usePcsData";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Embarques", href: "/pcs" },
  { name: "Favoritos", href: "/favorites" },
];

export function Header() {
  const location = useLocation();
  const { refresh } = usePcsRefresh();
  const { favoritesCount } = useFavorites();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn(
      "flex space-x-8",
      mobile && "flex-col space-x-0 space-y-4"
    )}>
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            location.pathname === item.href
              ? "text-primary border-b-2 border-primary pb-1"
              : "text-muted-foreground",
            mobile && "text-base py-2 px-4 rounded-lg hover:bg-muted border-b-0 pb-0"
          )}
        >
          <div className="flex items-center space-x-2">
            <span>{item.name}</span>
            {item.href === "/favorites" && favoritesCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {favoritesCount}
              </Badge>
            )}
          </div>
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-ocean text-primary-foreground transition-transform group-hover:scale-110">
            <Anchor className="h-5 w-5" />
          </div>
          <span className="hidden font-bold sm:inline-block text-xl bg-gradient-ocean bg-clip-text text-transparent">
            PCS Maritime
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          <NavLinks />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="hidden sm:flex"
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              isRefreshing && "animate-spin"
            )} />
            Atualizar
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 text-sm text-muted-foreground text-center">
                Nenhuma notificação recente
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Configurações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" />
                Gerenciar Favoritos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="mr-2 h-4 w-4" />
                Auto-atualização
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-6">
                <NavLinks mobile />
                
                <div className="border-t pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="w-full justify-start"
                  >
                    <RefreshCw className={cn(
                      "h-4 w-4 mr-2",
                      isRefreshing && "animate-spin"
                    )} />
                    Atualizar Dados
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}