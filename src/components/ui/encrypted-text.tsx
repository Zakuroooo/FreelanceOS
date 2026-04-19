"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

interface EncryptedTextProps {
  text: string;
  className?: string;
  encryptedClassName?: string;
  revealedClassName?: string;
  revealDelayMs?: number;
  triggerOnView?: boolean;
}

export function EncryptedText({
  text,
  className,
  encryptedClassName = "text-[rgba(255,255,255,0.3)]",
  revealedClassName = "text-[#FAFAFA]",
  revealDelayMs = 50,
  triggerOnView = true,
}: EncryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [revealed, setRevealed] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const scramble = useCallback(() => {
    if (hasTriggered) return;
    setHasTriggered(true);

    let iteration = 0;
    const maxIterations = text.length;

    const interval = setInterval(() => {
      setDisplayText((prev) => {
        return text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");
      });

      iteration += 1;

      if (iteration > maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setRevealed(true);
      }
    }, revealDelayMs);

    return () => clearInterval(interval);
  }, [text, revealDelayMs, hasTriggered]);

  useEffect(() => {
    if (!triggerOnView) {
      scramble();
    }
  }, [triggerOnView, scramble]);

  return (
    <span
      className={cn(
        "inline-block font-mono transition-colors duration-300",
        revealed ? revealedClassName : encryptedClassName,
        className
      )}
      onMouseEnter={() => {
        if (triggerOnView && !hasTriggered) scramble();
      }}
    >
      {displayText}
    </span>
  );
}
