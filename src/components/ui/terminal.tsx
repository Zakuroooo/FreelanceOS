'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export interface TerminalProps {
  commands: string[];
  outputs?: Record<number, string[]>;
  username?: string;
  className?: string;
  typingSpeed?: number;
  delayBetweenCommands?: number;
  initialDelay?: number;
  enableSound?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
  commands,
  outputs = {},
  username = 'freelancer',
  className = '',
  typingSpeed = 35,
  delayBetweenCommands = 800,
  initialDelay = 500,
  enableSound = true,
}) => {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<{ cmd: string; output?: string[] }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (enableSound && typeof window !== 'undefined') {
      const audio = new Audio('/sounds/sound.ogg');
      audio.volume = 0.5;
      audioRef.current = audio;
    }
  }, [enableSound]);

  const playKeystroke = () => {
    if (audioRef.current && enableSound) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {}); // catch auto-play policies silently
    }
  };

  useEffect(() => {
    if (!isInView) return;
    if (currentCommandIndex >= commands.length) return;

    let timeout: NodeJS.Timeout;
    const currentCommand = commands[currentCommandIndex];

    const typeCommand = async () => {
      setIsTyping(true);
      setDisplayedText('');

      // Initial delay for the first command
      if (currentCommandIndex === 0) {
        await new Promise((res) => setTimeout(res, initialDelay));
      }

      // Type out character by character
      for (let i = 0; i <= currentCommand.length; i++) {
        setDisplayedText(currentCommand.substring(0, i));
        if (i < currentCommand.length) {
          playKeystroke();
          await new Promise((res) => setTimeout(res, typingSpeed));
        }
      }

      setIsTyping(false);
      
      // Wait before showing output and moving to next command
      timeout = setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          {
            cmd: currentCommand,
            output: outputs[currentCommandIndex],
          },
        ]);
        setDisplayedText('');
        setCurrentCommandIndex((prev) => prev + 1);
        
        // Auto-scroll
        if (containerRef.current) {
          const scrollContainer = containerRef.current.querySelector('.terminal-scroll');
          if (scrollContainer) {
             scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }, delayBetweenCommands);
    };

    typeCommand();

    return () => clearTimeout(timeout);
  }, [currentCommandIndex, isInView, commands, outputs, delayBetweenCommands, initialDelay, typingSpeed]);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0d0d0d] font-mono shadow-2xl overflow-hidden flex flex-col ${className}`}
    >
      {/* macOS Window Controls */}
      <div className="flex h-11 items-center gap-2 border-b border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] px-4 shrink-0 transition-colors">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 text-center text-xs text-gray-500 font-sans tracking-tight">
          bash — {username}
        </div>
      </div>

      {/* Terminal Body */}
      <div className="terminal-scroll flex-1 overflow-y-auto p-6 text-[13px] leading-relaxed text-gray-300 space-y-5">
        {history.map((record, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-2 text-white">
              <span className="text-[#c30101] shrink-0 font-bold">{username}:~$</span>
              <span className="break-all">{record.cmd}</span>
            </div>
            {record.output && record.output.length > 0 && (
              <div className="mt-2 space-y-1.5 text-gray-400">
                {record.output.map((line, j) => (
                  <div key={j} className="flex gap-2">
                    {line.startsWith('✔') ? (
                      <span className="text-green-400 shrink-0">✔</span>
                    ) : line.startsWith('✖') ? (
                      <span className="text-red-400 shrink-0">✖</span>
                    ) : null}
                    <span className="break-all">{line.replace(/^[✔✖]\s/, '')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Current Active Line */}
        {currentCommandIndex < commands.length && (
          <div className="flex gap-2 text-white items-center">
            <span className="text-[#c30101] shrink-0 font-bold">{username}:~$</span>
            <span className="break-all">
              {displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-[8px] h-[15px] bg-white ml-1 align-middle"
                />
              )}
            </span>
          </div>
        )}
        
        {/* Blinking cursor after finished all commands */}
        {currentCommandIndex >= commands.length && (
          <div className="flex gap-2 text-white items-center">
            <span className="text-[#c30101] shrink-0 font-bold">{username}:~$</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-[8px] h-[15px] bg-white ml-1 align-middle"
            />
          </div>
        )}
      </div>
    </div>
  );
};
