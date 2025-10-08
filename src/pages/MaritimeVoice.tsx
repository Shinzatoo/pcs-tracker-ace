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
      </div>

      <style>{`
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
