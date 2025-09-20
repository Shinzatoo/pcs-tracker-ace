import logoAbtra from "@/assets/abtra-logo.png";
import logoAmigu from "@/assets/amigu-logo.png";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container flex h-20 items-center justify-center">
        <div className="flex items-center space-x-6 text-base text-muted-foreground">
          <span>Em colaboração com</span>
          <a 
            href="https://www.abtra.org.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            <img src={logoAbtra} alt="ABTRA" className="h-14" />
          </a>
          <span>e</span>
          <a 
            href="https://www.institutoamigu.org.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            <img src={logoAmigu} alt="Instituto AmiGU" className="h-12" />
          </a>
        </div>
      </div>
    </footer>
  );
}