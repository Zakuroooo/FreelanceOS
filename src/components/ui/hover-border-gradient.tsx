"use client";

import React, { useState, useEffect, ElementType } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type HoverBorderGradientProps<T extends ElementType = "button"> = {
  as?: T;
  containerClassName?: string;
  className?: string;
  duration?: number;
  clockwise?: boolean;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export function HoverBorderGradient<T extends ElementType = "button">({
  children,
  containerClassName,
  className,
  as,
  duration = 1,
  clockwise = true,
  ...props
}: HoverBorderGradientProps<T>) {
  const Tag = as || "button";
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState<string>("TOP");

  const rotateDirection = (currentDirection: string) => {
    const directions = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  const movingMap: Record<string, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, rgba(196,20,37,0.85) 0%, rgba(196,20,37,0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, rgba(196,20,37,0.85) 0%, rgba(196,20,37,0) 100%)",
    BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, rgba(196,20,37,0.85) 0%, rgba(196,20,37,0) 100%)",
    RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, rgba(196,20,37,0.85) 0%, rgba(196,20,37,0) 100%)",
  };

  const highlight =
    "radial-gradient(75% 181.2% at 50% 50%, rgba(196,20,37,0.25) 0%, rgba(196,20,37,0) 100%)";

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prev) => rotateDirection(prev));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-full content-center bg-transparent items-center flex-col flex-nowrap gap-[10px] h-min justify-center overflow-visible p-px decoration-clone w-fit",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-auto z-10 rounded-[inherit] px-6 py-2.5 text-sm font-medium",
          "bg-[#0A0A0F] text-[#FAFAFA]",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="bg-[#0A0A0F] absolute z-[1] flex-none inset-[2px] rounded-[100px]" />
    </Tag>
  );
}
