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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center relative">
      {/* Ambient grid background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary) / 0.15) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Central interface container */}
      <div className="relative flex items-center justify-center w-full h-screen">
        {/* Technical HUD Lines extending from center */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: isActive ? 0.8 : 0.5 }}>
          {/* Top lines */}
          <path d="M 50,80 L 200,80 L 220,100 L 300,100" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M 320,100 L 400,100 L 420,90 L 550,90" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
          <rect x="510" y="65" width="70" height="15" stroke="hsl(var(--primary))" strokeWidth="1" fill="hsl(var(--primary) / 0.1)" />
          <path d="M 700,80 L 800,80 L 820,100" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
          
          {/* Right side lines */}
          <path d="M 900,200 L 1100,200 L 1120,220 L 1200,220" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
          <circle cx="1150" cy="220" r="8" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" />
          <path d="M 1000,350 L 1150,350 L 1170,360" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
          <rect x="1180" y="340" width="50" height="30" stroke="hsl(var(--primary))" strokeWidth="1" fill="hsl(var(--primary) / 0.1)" />
          
          {/* Bottom lines */}
          <path d="M 950,600 L 1050,600 L 1070,620 L 1200,620" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M 600,680 L 700,680 L 720,660" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
          <rect x="400" y="670" width="80" height="20" stroke="hsl(var(--primary))" strokeWidth="1" fill="hsl(var(--primary) / 0.1)" />
          <path d="M 200,650 L 300,650 L 320,630" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
          
          {/* Left side lines */}
          <path d="M 50,300 L 150,300 L 170,320 L 250,320" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
          <rect x="80" y="380" width="60" height="25" stroke="hsl(var(--primary))" strokeWidth="1" fill="hsl(var(--primary) / 0.1)" />
          <path d="M 50,500 L 200,500 L 220,480" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.6" />
          
          {/* Connection lines to center */}
          <path d="M 580,100 L 680,300" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="5,5" />
          <path d="M 1100,350 L 800,400" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="5,5" />
          <path d="M 250,320 L 600,400" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="5,5" />
          <path d="M 700,660 L 720,500" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="5,5" />
        </svg>

        {/* Animated concentric rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[1, 2, 3, 4].map((ring) => (
            <div
              key={ring}
              className={`absolute rounded-full border transition-all duration-300 ${
                isActive ? 'border-primary/60' : 'border-primary/30'
              }`}
              style={{
                width: `${ring * 120}px`,
                height: `${ring * 120}px`,
                boxShadow: isActive 
                  ? `0 0 ${ring * 8}px hsl(var(--primary) / 0.6), inset 0 0 ${ring * 4}px hsl(var(--primary) / 0.4)`
                  : `0 0 ${ring * 3}px hsl(var(--primary) / 0.3), inset 0 0 ${ring * 2}px hsl(var(--primary) / 0.2)`,
                animation: `rotate-ring ${12 + ring * 4}s linear infinite ${ring % 2 === 0 ? 'reverse' : ''}`,
              }}
            >
              {/* Ring segments */}
              {ring === 2 && (
                <>
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1/2 shadow-lg shadow-primary/50" />
                  <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1/2 shadow-lg shadow-primary/50" />
                  <div className="absolute left-0 top-1/2 w-2 h-2 bg-primary rounded-full -translate-y-1/2 shadow-lg shadow-primary/50" />
                  <div className="absolute right-0 top-1/2 w-2 h-2 bg-primary rounded-full -translate-y-1/2 shadow-lg shadow-primary/50" />
                </>
              )}
            </div>
          ))}
          
          {/* Inner detailed ring with segments */}
          <div className="absolute" style={{ width: '350px', height: '350px' }}>
            <svg className="w-full h-full" viewBox="0 0 350 350" style={{ animation: 'rotate-arc 15s linear infinite' }}>
              {/* Main ring with gap indicators */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <g key={angle} transform={`rotate(${angle} 175 175)`}>
                  <line
                    x1="175" y1="30" x2="175" y2="50"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    opacity={isActive ? "0.9" : "0.5"}
                  />
                </g>
              ))}
              <circle
                cx="175"
                cy="175"
                r="140"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeDasharray="30 5"
                opacity={isActive ? "0.7" : "0.4"}
              />
            </svg>
          </div>
          
          {/* Rotating arc segments */}
          {[0, 120, 240].map((rotation) => (
            <div
              key={rotation}
              className="absolute"
              style={{
                width: '450px',
                height: '450px',
                animation: `rotate-arc 25s linear infinite`,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 450 450">
                <circle
                  cx="225"
                  cy="225"
                  r="215"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray="80 1200"
                  opacity={isActive ? "0.8" : "0.4"}
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 10px hsl(var(--primary)))' : 'none'
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
          {/* Multi-layered central orb with gradient */}
          <div className="absolute w-64 h-64 rounded-full" style={{
            background: `
              radial-gradient(circle at 45% 45%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
              radial-gradient(circle at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)
            `,
            boxShadow: isActive 
              ? '0 0 100px 50px hsl(var(--primary) / 0.3), inset 0 0 60px hsl(var(--primary) / 0.2)' 
              : '0 0 60px 30px hsl(var(--primary) / 0.15), inset 0 0 40px hsl(var(--primary) / 0.1)',
            animation: isActive ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
            transition: 'all 0.3s ease'
          }} />
          
          {/* Inner glow ring */}
          <div className={`absolute w-40 h-40 rounded-full border-2 transition-all duration-300 ${
            isActive ? 'border-primary' : 'border-primary/50'
          }`} style={{
            boxShadow: isActive 
              ? '0 0 40px hsl(var(--primary) / 0.5), inset 0 0 40px hsl(var(--primary) / 0.2)' 
              : '0 0 20px hsl(var(--primary) / 0.3), inset 0 0 20px hsl(var(--primary) / 0.1)',
          }} />
          
          {/* M.A.R.I.T.I.M.E Text */}
          <div className="relative z-20 text-center">
            <h1 className="text-4xl font-bold tracking-[0.4em] text-primary" style={{
              textShadow: isActive 
                ? '0 0 30px hsl(var(--primary)), 0 0 60px hsl(var(--primary) / 0.5), 0 0 90px hsl(var(--primary) / 0.3)'
                : '0 0 15px hsl(var(--primary) / 0.6), 0 0 30px hsl(var(--primary) / 0.3)',
              fontFamily: 'monospace',
              letterSpacing: '0.3em'
            }}>
              M.A.R.I.T.I.M.E
            </h1>
            
            {/* Animated indicator dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]' : 'bg-primary/40'
                  }`}
                  style={{
                    animation: isActive ? `blink ${0.6 + i * 0.08}s ease-in-out infinite` : 'none',
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* ElevenLabs widget */}
          <div className="absolute mt-32" 
               dangerouslySetInnerHTML={{ 
                 __html: '<elevenlabs-convai agent-id="agent_6401k6ckrp19e26rkg2qzpzsrwna"></elevenlabs-convai>' 
               }} 
          />
        </div>

        {/* Technical HUD Corner Data */}
        <div className="absolute top-12 left-12 text-primary/70 text-[10px] font-mono space-y-1.5 uppercase tracking-wider">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-primary/40'}`} />
            <div className="text-xs">System Online</div>
          </div>
          <div className="border-l border-primary/30 pl-2 space-y-0.5">
            <div>Status: {isActive ? 'Active' : 'Standby'}</div>
            <div>Voice: {isActive ? 'Detected' : 'Idle'}</div>
            <div>Latency: &lt;100ms</div>
            <div>Agent: Ready</div>
          </div>
          
          {/* Small circuit decoration */}
          <svg className="mt-3 opacity-40" width="60" height="40" viewBox="0 0 60 40">
            <path d="M 0,20 L 20,20 L 25,15 L 35,15 L 40,20 L 60,20" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" />
            <circle cx="25" cy="15" r="2" fill="hsl(var(--primary))" />
            <rect x="15" y="18" width="10" height="4" stroke="hsl(var(--primary))" strokeWidth="0.5" fill="hsl(var(--primary) / 0.2)" />
          </svg>
        </div>

        {/* Bottom right technical data */}
        <div className="absolute bottom-12 right-12 text-primary/70 text-[10px] font-mono text-right space-y-1.5 uppercase tracking-wider">
          <div className="border-r border-primary/30 pr-2 space-y-0.5">
            <div>Neural Link: Stable</div>
            <div>Processing: Real-time</div>
            <div>Audio: High-Fidelity</div>
            <div>Connection: Secure</div>
          </div>
          
          {/* Small circuit decoration */}
          <svg className="mt-3 ml-auto opacity-40" width="60" height="40" viewBox="0 0 60 40">
            <path d="M 0,20 L 20,20 L 25,25 L 35,25 L 40,20 L 60,20" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" />
            <circle cx="35" cy="25" r="2" fill="hsl(var(--primary))" />
            <rect x="35" y="18" width="10" height="4" stroke="hsl(var(--primary))" strokeWidth="0.5" fill="hsl(var(--primary) / 0.2)" />
          </svg>
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
