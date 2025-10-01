import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  RefreshCw, 
  Menu
} from "lucide-react";
import logoApp from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePcsRefresh } from "@/hooks/usePcsData";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Agente Maritime", href: "/agente" },
  { name: "Maritime Voice", href: "/voice" },
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
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img 
            src={logoApp} 
            alt="PCS Maritime Logo" 
            className="h-10 w-10 transition-transform group-hover:scale-110"
          />
          <span className="hidden sm:inline-block font-bold text-xl bg-gradient-ocean bg-clip-text text-transparent">
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
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}