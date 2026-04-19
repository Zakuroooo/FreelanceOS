"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

/* ——— Sub-components ——— */

export function Navbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <nav className={cn("fixed top-4 inset-x-0 z-[100] w-full px-4", className)}>
      {children}
    </nav>
  );
}

export function NavBody({ children, className, visible }: { children: React.ReactNode; className?: string; visible?: boolean }) {
  return (
    <motion.div
      animate={{
        backdropFilter: "blur(18px) saturate(170%)",
        width: visible ? "fit-content" : "100%",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn(
        "relative mx-auto flex items-center justify-between self-start",
        "rounded-full py-2.5 px-4 sm:px-6",
        className
      )}
      style={{
        maxWidth: visible ? "680px" : "1100px",
        background: "rgba(6,6,8,0.78)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 0 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 1px rgba(0,0,0,0.5)",
      }}
    >
      {children}
    </motion.div>
  );
}

export function NavItems({
  items,
  className,
  onItemClick,
}: {
  items: { name: string; link: string }[];
  className?: string;
  onItemClick?: () => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn("hidden sm:flex items-center gap-1 relative", className)}
    >
      {items.map((item, idx) => (
        <Link
          key={item.link}
          href={item.link}
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-3 py-1.5 text-[13px] font-normal transition-colors duration-150 whitespace-nowrap no-underline"
          style={{
            color: hovered === idx ? "rgba(240,238,248,0.88)" : "rgba(240,238,248,0.38)",
            letterSpacing: "-0.01em",
          }}
        >
          {hovered === idx && (
            <motion.span
              layoutId="nav-hover"
              className="absolute inset-0 rounded-md"
              style={{ background: "rgba(255,255,255,0.04)" }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
            />
          )}
          <span className="relative z-10">{item.name}</span>
        </Link>
      ))}
    </motion.div>
  );
}

export function NavbarLogo() {
  return (
    <Link href="/" className="flex items-center gap-0 flex-shrink-0 text-[16px] font-[800] tracking-[-0.05em] no-underline leading-none" style={{ color: "#F0EEF8" }}>
      Freelance<span style={{ color: "#c30101", fontStyle: "normal" }}>OS</span>
    </Link>
  );
}

export function NavbarButton({
  children,
  variant = "primary",
  className,
  onClick,
  href,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  if (variant === "primary") {
    return (
      <Link
        href={href || "/signup"}
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1.5 px-3.5 py-1.5",
          "rounded no-underline whitespace-nowrap",
          className
        )}
        style={{
          background: "#c30101",
          color: "white",
          fontSize: "10.5px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.opacity = "0.9"
          e.currentTarget.style.transform = "translateY(-1px)"
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(195,1,1,0.35)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.opacity = "1"
          e.currentTarget.style.transform = "translateY(0)"
          e.currentTarget.style.boxShadow = "none"
        }}
      >
        {children}
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path d="M1.5 7.5L7.5 1.5M7.5 1.5H2.5M7.5 1.5V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    );
  }

  return (
    <Link
      href={href || "/login"}
      onClick={onClick}
      className={cn(
        "text-[13px] font-normal px-2.5 py-1.5 rounded no-underline whitespace-nowrap",
        className
      )}
      style={{
        color: "rgba(240,238,248,0.38)",
        transition: "color 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = "rgba(240,238,248,0.88)"
        e.currentTarget.style.background = "rgba(255,255,255,0.04)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = "rgba(240,238,248,0.38)"
        e.currentTarget.style.background = "transparent"
      }}
    >
      {children}
    </Link>
  );
}

/* ——— Mobile components ——— */

export function MobileNav({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("sm:hidden", className)}>{children}</div>;
}

export function MobileNavHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-between w-full px-5 py-3 rounded-full", className)}
      style={{
        background: "rgba(6,6,8,0.85)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </div>
  );
}

export function MobileNavToggle({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ background: "none", border: "none", cursor: "pointer", color: "#F0EEF8", padding: "4px", lineHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
      aria-label="Toggle menu"
    >
      {isOpen ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>
      )}
    </button>
  );
}

export function MobileNavMenu({
  children,
  isOpen,
  onClose,
  className,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.18 } }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }}
          className={cn("absolute top-full left-0 right-0 mt-2 rounded-md overflow-hidden", className)}
          style={{
            background: "rgba(6,6,8,0.97)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            padding: "12px 20px 20px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.65)",
          }}
        >
          <div className="flex flex-col gap-0">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
