'use client'

import { useEffect, useState } from 'react'

const terminals = [
  {
    label: 'Discovering clients...',
    lines: [
      { text: '> scanning "dentists in Los Angeles"', delay: 0 },
      { text: '> found 847 businesses', delay: 600, red: true },
      { text: '> gap detected: no website (312)', delay: 1100 },
      { text: '> gap detected: no social (198)', delay: 1600 },
      { text: '> top matches ranked by score', delay: 2100 },
      { text: '✓ 847 clients ready', delay: 2600, green: true },
    ],
  },
  {
    label: 'Generating pitch...',
    lines: [
      { text: '> client: Bright Smile Dental Co.', delay: 0 },
      { text: '> gap: no website detected', delay: 500 },
      { text: '> role: web developer', delay: 900 },
      { text: '> generating personalised pitch...', delay: 1300 },
      { text: '> quality score: 94/100', delay: 2200, red: true },
      { text: '✓ pitch ready to send', delay: 2700, green: true },
    ],
  },
  {
    label: 'Sending outreach...',
    lines: [
      { text: '> approving pitch for Bright Smile', delay: 0 },
      { text: '> sending email via Resend...', delay: 600 },
      { text: '> sending LinkedIn DM...', delay: 1100 },
      { text: '> sending Instagram DM...', delay: 1600 },
      { text: '> 3 channels delivered', delay: 2100, red: true },
      { text: '✓ client notified. awaiting reply.', delay: 2700, green: true },
    ],
  },
  {
    label: 'Deal closed...',
    lines: [
      { text: '> client replied: "interested"', delay: 0 },
      { text: '> deal created: $2,800.00', delay: 600 },
      { text: '> escrow: payment link sent', delay: 1100 },
      { text: '> stripe: funds secured ✓', delay: 1700, red: true },
      { text: '> work delivered + confirmed', delay: 2300 },
      { text: '✓ $2,576 paid out (8% fee)', delay: 2900, green: true },
    ],
  },
]

interface TerminalLine {
  text: string
  delay: number
  red?: boolean
  green?: boolean
}

export default function AuthRightPanel() {
  const [terminalIndex, setTerminalIndex] = useState(0)
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [cycling, setCycling] = useState(false)

  useEffect(() => {
    setVisibleLines([])
    setCycling(false)
    const current = terminals[terminalIndex]
    const timers: ReturnType<typeof setTimeout>[] = []

    current.lines.forEach((line: TerminalLine, i: number) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, i])
      }, line.delay + 400)
      timers.push(t)
    })

    // Auto-advance after last line + pause
    const lastDelay = current.lines[current.lines.length - 1].delay
    const advance = setTimeout(() => {
      setCycling(true)
      setTimeout(() => {
        setTerminalIndex(prev => (prev + 1) % terminals.length)
      }, 800)
    }, lastDelay + 2200)
    timers.push(advance)

    return () => timers.forEach(clearTimeout)
  }, [terminalIndex])

  const current = terminals[terminalIndex]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0a0f',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background red glow orb */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(196,20,37,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Terminal window */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0f0f14',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Terminal header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0c0c11',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#c41425', opacity: 0.8 }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <span
            style={{
              marginLeft: '8px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: '"SF Mono","JetBrains Mono",monospace',
              letterSpacing: '0.05em',
            }}
          >
            freelanceos — {current.label}
          </span>
        </div>

        {/* Terminal body */}
        <div
          style={{
            padding: '20px',
            minHeight: '220px',
            fontFamily: '"SF Mono","JetBrains Mono",monospace',
            fontSize: '13px',
            lineHeight: '1.8',
          }}
        >
          {current.lines.map((line: TerminalLine, i: number) => (
            <div
              key={`${terminalIndex}-${i}`}
              style={{
                opacity: visibleLines.includes(i) ? 1 : 0,
                transform: visibleLines.includes(i)
                  ? 'translateY(0)' : 'translateY(4px)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                color: line.green
                  ? '#00C9A7'
                  : line.red
                  ? '#c41425'
                  : 'rgba(255,255,255,0.55)',
              }}
            >
              {line.text}
              {/* Blinking cursor on last visible line */}
              {i === visibleLines[visibleLines.length - 1] &&
                !cycling && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '7px',
                      height: '13px',
                      backgroundColor: '#c41425',
                      marginLeft: '3px',
                      verticalAlign: 'middle',
                      animation: 'blink 1s step-end infinite',
                    }}
                  />
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Step indicators */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '28px',
        }}
      >
        {terminals.map((_, i) => (
          <button
            key={i}
            onClick={() => setTerminalIndex(i)}
            style={{
              width: i === terminalIndex ? '24px' : '6px',
              height: '6px',
              borderRadius: '3px',
              backgroundColor:
                i === terminalIndex
                  ? '#c41425'
                  : 'rgba(255,255,255,0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Social proof */}
      <p
        style={{
          marginTop: '24px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.2)',
          fontFamily: '"SF Mono","JetBrains Mono",monospace',
          letterSpacing: '0.08em',
          textAlign: 'center',
        }}
      >
        2,400+ FREELANCERS RUNNING ON AUTOPILOT
      </p>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
