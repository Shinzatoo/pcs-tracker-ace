import logoAbtra from "@/assets/abtra-logo.png";
import logoAmigu from "@/assets/amigu-logo.png";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container flex h-20 items-center justify-center">
        <div className="flex items-center space-x-6 text-base text-muted-foreground">
          <span>Em colaboração com</span>
          <img src={logoAbtra} alt="ABTRA" className="h-12" />
          <span>e</span>
          <img src={logoAmigu} alt="Instituto AmiGU" className="h-12" />
        </div>
      </div>
    </footer>
  );
}