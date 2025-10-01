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
    <div className="container mx-auto p-6 min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center relative overflow-hidden">
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

      {/* Compact Header */}
      <div className="text-center mb-8 animate-fade-in relative z-10">
        <h1 className="text-4xl font-bold bg-gradient-ocean bg-clip-text text-transparent mb-2">
          Maritime Voice
        </h1>
        <p className="text-muted-foreground text-sm">Assistente de voz com IA em tempo real</p>
      </div>

      {/* Voice Interface Card - Main Focus */}
      <Card className="w-full max-w-5xl bg-card/40 backdrop-blur-xl border-primary/40 shadow-2xl animate-scale-in relative z-10 overflow-hidden">
        {/* Animated Border Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 rounded-lg bg-gradient-ocean opacity-20 blur-xl animate-pulse" />
          <div className="absolute inset-[1px] rounded-lg bg-card/90" />
        </div>

        <div className="relative p-12">
          {/* ElevenLabs Widget Container - Centered and Prominent */}
          <div className="flex justify-center items-center min-h-[500px] relative">
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

        </div>
      </Card>

      {/* Compact Instructions Below */}
      <div className="mt-6 flex items-center justify-center gap-8 text-xs text-muted-foreground/60 animate-fade-in relative z-10" style={{ animationDelay: '0.3s' }}>
        <span>🎤 Clique para falar</span>
        <span className="text-border">•</span>
        <span>🤖 IA processa</span>
        <span className="text-border">•</span>
        <span>🔊 Resposta em voz</span>
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
