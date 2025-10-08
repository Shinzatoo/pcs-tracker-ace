import { useCallback, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2Icon, PhoneIcon, PhoneOffIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShimmeringText } from "@/components/ui/shimmering-text";

const DEFAULT_AGENT = {
  agentId: "agent_6401k6ckrp19e26rkg2qzpzsrwna",
  name: "M.A.R.I.T.I.M.E",
  description: "Tap to start voice chat",
};

type AgentState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | null;

export default function MaritimeVoice() {
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => {
      console.error("Error:", error);
      setAgentState("disconnected");
    },
  });

  const startConversation = useCallback(async () => {
    try {
      setErrorMessage(null);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: DEFAULT_AGENT.agentId,
        connectionType: "webrtc",
        onStatusChange: (status) => setAgentState(status.status),
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      setAgentState("disconnected");
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage("Please enable microphone permissions in your browser.");
      }
    }
  }, [conversation]);

  const handleCall = useCallback(() => {
    if (agentState === "disconnected" || agentState === null) {
      setAgentState("connecting");
      startConversation();
    } else if (agentState === "connected") {
      conversation.endSession();
      setAgentState("disconnected");
    }
  }, [agentState, conversation, startConversation]);

  const isCallActive = agentState === "connected";
  const isTransitioning =
    agentState === "connecting" || agentState === "disconnecting";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="flex h-[500px] w-full max-w-md flex-col items-center justify-center overflow-hidden p-8">
        <div className="flex flex-col items-center gap-8">
          <div className="relative size-48">
            <div className="relative h-full w-full rounded-full overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
              {/* Animated orb layers */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-radial from-primary/30 to-transparent"
                animate={{
                  scale: isCallActive ? [1, 1.2, 1] : 1,
                  opacity: isCallActive ? [0.5, 0.8, 0.5] : 0.3,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute inset-4 rounded-full bg-gradient-radial from-primary/40 to-transparent"
                animate={{
                  scale: isCallActive ? [1, 1.15, 1] : 1,
                  opacity: isCallActive ? [0.6, 0.9, 0.6] : 0.4,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
              <div className="absolute inset-8 rounded-full bg-primary/60 backdrop-blur-sm" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <h2 className="text-2xl font-bold tracking-[0.3em]">{DEFAULT_AGENT.name}</h2>
            <AnimatePresence mode="wait">
              {errorMessage ? (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-destructive text-center text-sm"
                >
                  {errorMessage}
                </motion.p>
              ) : agentState === "disconnected" || agentState === null ? (
                <motion.p
                  key="disconnected"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-muted-foreground text-sm"
                >
                  {DEFAULT_AGENT.description}
                </motion.p>
              ) : (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full transition-all duration-300",
                      agentState === "connected" && "bg-green-500",
                      isTransitioning && "bg-primary/60 animate-pulse"
                    )}
                  />
                  <span className="text-sm capitalize">
                    {isTransitioning ? (
                      <ShimmeringText text={agentState} />
                    ) : (
                      <span className="text-green-600">Connected</span>
                    )}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            onClick={handleCall}
            disabled={isTransitioning}
            size="icon"
            variant={isCallActive ? "secondary" : "default"}
            className="h-14 w-14 rounded-full"
          >
            <AnimatePresence mode="wait">
              {isTransitioning ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                  }}
                >
                  <Loader2Icon className="h-6 w-6" />
                </motion.div>
              ) : isCallActive ? (
                <motion.div
                  key="end"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <PhoneOffIcon className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <PhoneIcon className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </Card>
    </div>
  );
}
