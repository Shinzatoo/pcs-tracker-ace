import { useEffect, useState } from "react";

export default function MaritimeVoice() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Load ElevenLabs script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    // Detect audio activity
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;
    let rafId: number;

    const startAudioDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 256;
        microphone.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const checkAudio = () => {
          analyser!.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setIsActive(average > 30);
          rafId = requestAnimationFrame(checkAudio);
        };
        
        checkAudio();
      } catch (err) {
        console.error('Microphone access denied:', err);
      }
    };

    // Delay audio detection to allow user interaction first
    const timer = setTimeout(startAudioDetection, 1000);

    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      if (microphone) microphone.disconnect();
      if (audioContext) audioContext.close();
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Ambient grid background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary) / 0.15) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Central interface container */}
      <div className="relative flex items-center justify-center">
        {/* Animated concentric rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[1, 2, 3, 4, 5].map((ring) => (
            <div
              key={ring}
              className={`absolute rounded-full border transition-all duration-300 ${
                isActive ? 'border-primary/60' : 'border-primary/30'
              }`}
              style={{
                width: `${ring * 140}px`,
                height: `${ring * 140}px`,
                boxShadow: isActive 
                  ? `0 0 ${ring * 5}px hsl(var(--primary) / 0.6), inset 0 0 ${ring * 3}px hsl(var(--primary) / 0.4)`
                  : `0 0 ${ring * 2}px hsl(var(--primary) / 0.3), inset 0 0 ${ring * 1}px hsl(var(--primary) / 0.2)`,
                animation: `rotate-ring ${15 + ring * 3}s linear infinite ${ring % 2 === 0 ? 'reverse' : ''}`,
              }}
            >
              {/* Ring segments */}
              {ring % 2 === 0 && (
                <>
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1/2 shadow-lg shadow-primary/50" />
                  <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1/2 shadow-lg shadow-primary/50" />
                </>
              )}
            </div>
          ))}
          
          {/* Rotating arc segments */}
          {[0, 120, 240].map((rotation) => (
            <div
              key={rotation}
              className="absolute"
              style={{
                width: '500px',
                height: '500px',
                animation: `rotate-arc 20s linear infinite`,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 500 500">
                <circle
                  cx="250"
                  cy="250"
                  r="240"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray="100 1400"
                  opacity={isActive ? "0.8" : "0.4"}
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 8px hsl(var(--primary)))' : 'none'
                  }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ))}
        </div>

        {/* Central content */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Central glow orb */}
          <div className={`absolute w-32 h-32 rounded-full transition-all duration-300 ${
            isActive 
              ? 'bg-primary/30 shadow-[0_0_80px_40px_hsl(var(--primary)/0.4)]' 
              : 'bg-primary/10 shadow-[0_0_40px_20px_hsl(var(--primary)/0.2)]'
          }`} style={{
            animation: isActive ? 'pulse-glow 1s ease-in-out infinite' : 'none'
          }} />
          
          {/* M.A.R.I.T.I.M.E Text */}
          <div className="relative z-20 text-center">
            <h1 className="text-5xl font-bold tracking-[0.3em] text-primary mb-2" style={{
              textShadow: isActive 
                ? '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5)'
                : '0 0 10px hsl(var(--primary) / 0.5)',
              fontFamily: 'monospace',
            }}>
              M.A.R.I.T.I.M.E
            </h1>
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-primary' : 'bg-primary/40'
                  }`}
                  style={{
                    animation: isActive ? `blink ${0.5 + i * 0.1}s ease-in-out infinite` : 'none',
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Hidden ElevenLabs widget - still functional */}
          <div className="absolute opacity-0 pointer-events-auto" 
               dangerouslySetInnerHTML={{ 
                 __html: '<elevenlabs-convai agent-id="agent_6401k6ckrp19e26rkg2qzpzsrwna"></elevenlabs-convai>' 
               }} 
          />
        </div>

        {/* Corner HUD elements */}
        <div className="absolute top-8 left-8 text-primary/60 text-xs font-mono space-y-1">
          <div>STATUS: {isActive ? 'ACTIVE' : 'STANDBY'}</div>
          <div>SYSTEM: ONLINE</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-primary/40'}`} />
            VOICE: {isActive ? 'DETECTED' : 'IDLE'}
          </div>
        </div>

        <div className="absolute bottom-8 right-8 text-primary/60 text-xs font-mono text-right space-y-1">
          <div>AI AGENT: READY</div>
          <div>LATENCY: &lt;100MS</div>
        </div>
      </div>

      <style>{`
        @keyframes rotate-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes rotate-arc {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
