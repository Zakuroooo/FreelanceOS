"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DotPoint {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
}

interface WorldMapProps {
  dots?: DotPoint[];
  className?: string;
  dotColor?: string;
  lineColor?: string;
}

function latLngToXY(lat: number, lng: number, width: number, height: number) {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

export default function WorldMap({
  dots = [],
  className,
  dotColor = "rgba(196,20,37,0.9)",
  lineColor = "rgba(196,20,37,0.3)",
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 400 });

  useEffect(() => {
    const obs = new ResizeObserver(([e]) => {
      if (e) setDims({ w: e.contentRect.width, h: e.contentRect.width * 0.5 });
    });
    if (svgRef.current?.parentElement) obs.observe(svgRef.current.parentElement);
    return () => obs.disconnect();
  }, []);

  const { w, h } = dims;

  // Generate dot grid for world map outline
  const mapDots: { x: number; y: number }[] = [];
  const step = 12;
  for (let lat = -70; lat <= 80; lat += step) {
    for (let lng = -170; lng <= 180; lng += step) {
      // Simple landmass approximation
      if (isLand(lat, lng)) {
        const { x, y } = latLngToXY(lat, lng, w, h);
        mapDots.push({ x, y });
      }
    }
  }

  return (
    <div className={cn("w-full relative", className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-auto"
        style={{ overflow: "visible" }}
      >
        {/* Map dots */}
        {mapDots.map((dot, i) => (
          <circle
            key={`map-${i}`}
            cx={dot.x}
            cy={dot.y}
            r={1.2}
            fill="rgba(255,255,255,0.12)"
          />
        ))}

        {/* Connection lines */}
        {dots.map((dot, i) => {
          const start = latLngToXY(dot.start.lat, dot.start.lng, w, h);
          const end = latLngToXY(dot.end.lat, dot.end.lng, w, h);
          const midX = (start.x + end.x) / 2;
          const midY = Math.min(start.y, end.y) - 50;

          return (
            <g key={`line-${i}`}>
              <motion.path
                d={`M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`}
                fill="none"
                stroke={lineColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
              {/* Start dot */}
              <motion.circle
                cx={start.x}
                cy={start.y}
                r={3}
                fill={dotColor}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.3, duration: 0.5 }}
              />
              {/* Start glow */}
              <motion.circle
                cx={start.x}
                cy={start.y}
                r={8}
                fill="none"
                stroke={dotColor}
                strokeWidth="0.8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{
                  delay: i * 0.3 + 0.5,
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* End dot */}
              <motion.circle
                cx={end.x}
                cy={end.y}
                r={3}
                fill={dotColor}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.3 + 1.2, duration: 0.5 }}
              />
              {/* End glow */}
              <motion.circle
                cx={end.x}
                cy={end.y}
                r={8}
                fill="none"
                stroke={dotColor}
                strokeWidth="0.8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{
                  delay: i * 0.3 + 1.7,
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Very rough landmass detection — enough for a dot-grid world map */
function isLand(lat: number, lng: number): boolean {
  // North America
  if (lat > 25 && lat < 72 && lng > -140 && lng < -55) return true;
  // Central America
  if (lat > 7 && lat < 25 && lng > -120 && lng < -75) return true;
  // South America
  if (lat > -55 && lat < 12 && lng > -82 && lng < -34) return true;
  // Europe
  if (lat > 35 && lat < 72 && lng > -12 && lng < 45) return true;
  // Africa
  if (lat > -35 && lat < 37 && lng > -18 && lng < 52) return true;
  // Middle East
  if (lat > 12 && lat < 42 && lng > 25 && lng < 63) return true;
  // Russia / Central Asia
  if (lat > 42 && lat < 75 && lng > 45 && lng < 180) return true;
  // South / SE Asia
  if (lat > -10 && lat < 42 && lng > 63 && lng < 145) return true;
  // Australia
  if (lat > -45 && lat < -10 && lng > 112 && lng < 155) return true;
  // Japan
  if (lat > 30 && lat < 46 && lng > 129 && lng < 146) return true;
  // Indonesia
  if (lat > -10 && lat < 6 && lng > 95 && lng < 141) return true;

  return false;
}
