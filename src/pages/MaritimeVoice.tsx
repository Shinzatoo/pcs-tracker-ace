import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Mic, Waves, Sparkles } from "lucide-react";

export default function MaritimeVoice() {
  useEffect(() => {
    // Load ElevenLabs script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="container mx-auto p-6 min-h-[calc(100vh-8rem)] flex flex-col items-center justify-start pt-12 relative overflow-hidden">
      {/* Animated Background Grid - Lower positioning */}
      <div className="absolute bottom-0 left-0 right-0 h-[60vh] pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'grid-flow 20s linear infinite'
        }} />
      </div>

      {/* Floating Particles - Lower positioning */}
      <div className="absolute bottom-0 left-0 right-0 h-[70vh] pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${50 + Math.random() * 50}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header Section */}
      <div className="text-center mb-8 space-y-4 animate-fade-in relative z-10">
        <div className="inline-block relative">
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-ocean blur-2xl opacity-30 animate-pulse" />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Waves className="w-8 h-8 text-primary animate-pulse" />
              <h1 className="text-6xl font-bold bg-gradient-ocean bg-clip-text text-transparent tracking-tight">
                Maritime Voice
              </h1>
              <Sparkles className="w-8 h-8 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            
            {/* Animated Underline */}
            <div className="flex items-center justify-center gap-2">
              <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
              <div className="h-1 w-12 bg-gradient-ocean rounded-full" />
              <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Interaja com o Maritime através de voz. Faça perguntas sobre operações de navios, status portuário e cronogramas de embarque.
        </p>

        {/* Tech Stats */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-muted-foreground">IA Ativa</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            <span className="text-muted-foreground">Português BR</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
            <span className="text-muted-foreground">Tempo Real</span>
          </div>
        </div>
      </div>

      {/* Voice Interface Card */}
      <Card className="w-full max-w-4xl bg-card/30 backdrop-blur-xl border-primary/30 shadow-2xl animate-scale-in relative z-10 overflow-hidden">
        {/* Animated Border Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 rounded-lg bg-gradient-ocean opacity-20 blur-xl animate-pulse" />
          <div className="absolute inset-[1px] rounded-lg bg-card/90" />
        </div>

        <div className="relative p-8">
          {/* Header with Icon */}
          <div className="flex items-center justify-center mb-6 gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-12 h-12 rounded-full bg-gradient-ocean flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Assistente de Voz</h2>
              <p className="text-xs text-muted-foreground">Powered by ElevenLabs</p>
            </div>
          </div>

          {/* ElevenLabs Widget Container */}
          <div className="flex justify-center items-center min-h-[400px] relative">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: '<elevenlabs-convai agent-id="agent_6401k6ckrp19e26rkg2qzpzsrwna"></elevenlabs-convai>' 
              }} 
            />
            
            {/* Decorative Elements - Positioned lower */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-6 border-t border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group space-y-3 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-ocean flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎤</span>
                </div>
                <h3 className="font-semibold text-center">Clique para Falar</h3>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Pressione o botão e fale sua pergunta em voz alta
                </p>
              </div>
              
              <div className="group space-y-3 p-4 rounded-lg bg-gradient-to-br from-accent/5 to-transparent hover:from-accent/10 transition-all">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-semibold text-center">Processamento IA</h3>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Maritime analisa sua solicitação em tempo real
                </p>
              </div>
              
              <div className="group space-y-3 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-all">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-ocean flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🔊</span>
                </div>
                <h3 className="font-semibold text-center">Resposta em Voz</h3>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Ouça a resposta em áudio natural e claro
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer Info */}
      <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground animate-fade-in relative z-10" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span>Sistema Online</span>
        </div>
        <span className="text-border">•</span>
        <span>ElevenLabs AI Technology</span>
        <span className="text-border">•</span>
        <span>Maritime Voice Assistant v2.0</span>
      </div>

      <style>{`
        @keyframes grid-flow {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
      `}</style>
    </div>
  );
}
