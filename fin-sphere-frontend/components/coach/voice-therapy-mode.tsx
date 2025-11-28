"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, Brain } from "lucide-react"

export function VoiceTherapyMode() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(32).fill(0.2))
  const animationRef = useRef<number | null>(null)

  // Simulate audio visualization
  useEffect(() => {
    if (isListening) {
      const animate = () => {
        setAudioLevels((prev) => prev.map(() => 0.2 + Math.random() * 0.8))
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setAudioLevels(Array(32).fill(0.2))
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isListening])

  const handleToggleListening = () => {
    if (!isListening) {
      setIsListening(true)
      setTranscript("")
      setAiResponse("")
      // Simulate speech recognition
      setTimeout(() => {
        setTranscript(
          "I'm feeling really stressed about that client rejection. I spent three weeks on that proposal and they just said no without any feedback...",
        )
      }, 2000)
      setTimeout(() => {
        setAiResponse(
          "I hear that you're feeling frustrated about the client rejection. That's a completely valid response—three weeks is a significant investment. Let me help put this in perspective: Looking at your 73-day runway, you're financially safe. This rejection doesn't threaten your stability. Would you like to explore what you learned from this proposal that could strengthen future pitches?",
        )
        setIsListening(false)
      }, 5000)
    } else {
      setIsListening(false)
    }
  }

  return (
    <Card className="border-[#E2E8F0] overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#1A2B3C] to-[#2D3748] text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#00D4AA]" />
            Voice Therapy Mode
          </CardTitle>
          <Badge variant="outline" className="text-[#00D4AA] border-[#00D4AA]/50 text-xs">
            {isListening ? "Listening..." : "Ready"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Audio Visualizer */}
        <div className="relative h-32 flex items-center justify-center mb-6 bg-[#F7FAFC] rounded-xl overflow-hidden">
          <div className="flex items-center justify-center gap-1 h-full px-4">
            {audioLevels.map((level, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full transition-all duration-100"
                style={{
                  height: `${level * 80}%`,
                  background: isListening ? `linear-gradient(to top, #00D4AA, #667EEA)` : "#E2E8F0",
                }}
              />
            ))}
          </div>
          {!isListening && !transcript && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F7FAFC]/80">
              <p className="text-sm text-[#2D3748]/70">Click the microphone to start venting</p>
            </div>
          )}
        </div>

        {/* Microphone Button */}
        <div className="flex justify-center mb-6">
          <Button
            size="lg"
            onClick={handleToggleListening}
            className={`
              w-20 h-20 rounded-full transition-all duration-300
              ${isListening ? "bg-[#FF4D4D] hover:bg-[#FF4D4D]/90 animate-pulse" : "teal-gradient hover:opacity-90"}
            `}
          >
            {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-[#1A2B3C]" />}
          </Button>
        </div>

        <p className="text-center text-sm text-[#2D3748]/70 mb-6">
          {isListening ? "Speak freely about your financial concerns..." : "Start Venting Session"}
        </p>

        {/* Transcript */}
        {transcript && (
          <div className="mb-4 p-4 bg-[#F7FAFC] rounded-lg border border-[#E2E8F0]">
            <p className="text-xs text-[#2D3748]/50 mb-2 font-medium">Your words:</p>
            <p className="text-sm text-[#1A2B3C] leading-relaxed">{transcript}</p>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && (
          <div className="p-4 bg-gradient-to-r from-[#00D4AA]/10 to-[#667EEA]/10 rounded-lg border border-[#00D4AA]/20">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-[#00D4AA]" />
              <p className="text-xs text-[#00D4AA] font-medium">AI Coach Response:</p>
            </div>
            <p className="text-sm text-[#1A2B3C] leading-relaxed">{aiResponse}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
