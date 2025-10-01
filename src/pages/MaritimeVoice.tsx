import { useEffect } from "react";
import { Card } from "@/components/ui/card";

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
    <div className="container mx-auto p-6 min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
      {/* Header Section */}
      <div className="text-center mb-12 space-y-4 animate-fade-in">
        <div className="inline-block">
          <h1 className="text-5xl font-bold bg-gradient-ocean bg-clip-text text-transparent mb-3">
            Maritime Voice
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-ocean rounded-full animate-pulse" />
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Interact with Maritime through voice. Ask questions about vessel operations, port status, and shipping schedules.
        </p>
      </div>

      {/* Voice Interface Card */}
      <Card className="w-full max-w-4xl bg-card/50 backdrop-blur-sm border-primary/20 shadow-xl animate-scale-in">
        <div className="p-8">
          {/* Status Indicator */}
          <div className="flex items-center justify-center mb-6 space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">AI Agent Ready</span>
          </div>

          {/* ElevenLabs Widget Container */}
          <div className="flex justify-center items-center min-h-[400px] relative">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: '<elevenlabs-convai agent-id="agent_6401k6ckrp19e26rkg2qzpzsrwna"></elevenlabs-convai>' 
              }} 
            />
            
            {/* Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🎤</span>
                </div>
                <h3 className="font-medium text-sm">Click to Speak</h3>
                <p className="text-xs text-muted-foreground">Press the button and speak your query</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-medium text-sm">AI Processing</h3>
                <p className="text-xs text-muted-foreground">Maritime analyzes your request</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🔊</span>
                </div>
                <h3 className="font-medium text-sm">Voice Response</h3>
                <p className="text-xs text-muted-foreground">Listen to the answer</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <p>Powered by ElevenLabs AI • Maritime Voice Assistant</p>
      </div>
    </div>
  );
}
