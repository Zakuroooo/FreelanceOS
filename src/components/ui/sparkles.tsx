"use client";

import { useEffect, useId, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface SparklesCoreProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
  className?: string;
}

export function SparklesCore({
  id,
  background = "transparent",
  minSize = 1,
  maxSize = 2.5,
  speed = 1,
  particleColor = "#C41425",
  particleDensity = 100,
}: SparklesCoreProps) {
  const generatedId = useId();
  const sparkleId = id || generatedId;

  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      opacity: number;
      duration: number;
      delay: number;
    }>
  >([]);

  const generateParticles = useCallback(() => {
    const count = Math.min(particleDensity, 150);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      opacity: Math.random() * 0.8 + 0.2,
      duration: (Math.random() * 2.5 + 1.5) / speed,
      delay: Math.random() * 3,
    }));
  }, [particleDensity, minSize, maxSize, speed]);

  useEffect(() => {
    setParticles(generateParticles());
  }, [generateParticles]);

  return (
    <div
      id={sparkleId}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background,
      }}
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particleColor,
            borderRadius: '50%',
            pointerEvents: 'none',
            boxShadow: `0 0 ${particle.size * 3}px ${particleColor}`,
          }}
          animate={{
            opacity: [0, particle.opacity, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
