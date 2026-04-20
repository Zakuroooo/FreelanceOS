'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

// Monospace specifically for data (prices, features, periods)
const monoFont = {
  fontFamily: '"SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
}

function RedCheck() {
  return (
    <div style={{
      width: '14px',
      height: '14px',
      background: 'rgba(196,20,37,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: '2px', // perfectly center with text
      flexShrink: 0
    }}>
      <Check size={8} color="#c41425" strokeWidth={4} />
    </div>
  )
}

export default function Pricing() {
  return (
    <section id="pricing" style={{ padding: '100px 0', background: '#050505', position: 'relative' }}>
      
      {/* Single subtle overall glow — centered behind the whole section */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(196,20,37,0.05) 0%, transparent 65%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Expanded MaxWidth to 1200px to perfectly align with Navbar bounds and eliminate massive side empty space */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* Dynamic 3-Column Layout: Card | TEXT | Card */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '32px', 
          alignItems: 'stretch' 
        }}>
          
          {/* FREE TIER - Left Column [1] */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              background: '#09090C', 
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0px', 
              padding: '32px 32px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >

            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFA', marginBottom: '24px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              Free
            </h3>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '48px', fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.04em', ...monoFont }}>$0</span>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '40px', ...monoFont }}>
              / month
            </div>

            <button style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: '0px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#FAFAFA',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '40px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#FAFAFA';
              e.currentTarget.style.color = '#050505';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#FAFAFA';
            }}
            >
              Get Started
            </button>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <RedCheck />
                <span style={{ fontSize: '12px', color: '#FAFAFA', lineHeight: 1.4, ...monoFont }}>10 automated pitches/month</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <RedCheck />
                <span style={{ fontSize: '12px', color: '#FAFAFA', lineHeight: 1.4, ...monoFont }}>3 client searches/day</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <RedCheck />
                <span style={{ fontSize: '12px', color: '#FAFAFA', lineHeight: 1.4, ...monoFont }}>Email outreach only</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <RedCheck />
                <span style={{ fontSize: '12px', color: '#FAFAFA', lineHeight: 1.4, ...monoFont }}>Basic deal tracking</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <RedCheck />
                <span style={{ fontSize: '12px', color: '#FAFAFA', lineHeight: 1.4, ...monoFont }}>8% platform commission</span>
              </li>
            </ul>
          </motion.div>

          {/* FLOATING TEXT BLOCK - Middle Column [2] */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              padding: '24px',
            }}
          >
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.04em', marginBottom: '24px' }}>
              PRICING.
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, ...monoFont }}>
              Automate your business.
              <br />No hidden fees.
              <br />Valid forever.
            </p>
          </motion.div>

          {/* PRO TIER - Right Column [3] */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              background: '#0c0c10', 
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0px', 
              padding: '32px 32px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              position: 'relative',
            }}
          >

            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FAFAFA', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              Pro
              <span style={{ fontSize: '9px', background: 'rgba(196,20,37,0.1)', color: '#c41425', padding: '3px 6px', letterSpacing: '0.1em', fontWeight: 700, ...monoFont, textTransform: 'uppercase' }}>POPULAR</span>
            </h3>

            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '48px', fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.04em', ...monoFont }}>$19</span>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '40px', ...monoFont }}>
              / month
            </div>

            <button style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: '0px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'white',
              background: '#c41425',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '40px',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#e6182c'}
            onMouseOut={(e) => e.currentTarget.style.background = '#c41425'}
            >
              Start Pro Trial
            </button>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <RedCheck />
                <span style={{ fontSize: '12px', color: '#FAFAFA', lineHeight: 1.4, ...monoFont }}>Unlimited AI pitches</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <RedCheck />
                <span style={{ fontSize: '12px', color: '#FAFAFA', lineHeight: 1.4, ...monoFont }}>Unlimited client searches</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <RedCheck />
                <span style={{ fontSize: '12px', color: '#FAFAFA', lineHeight: 1.4, ...monoFont }}>Email, LinkedIn & IG DMs</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <RedCheck />
                <span style={{ fontSize: '12px', color: '#FAFAFA', lineHeight: 1.4, ...monoFont }}>Priority n8n outreach config</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <RedCheck />
                <span style={{ fontSize: '12px', color: '#FAFAFA', lineHeight: 1.4, ...monoFont }}>Stripe escrow protection</span>
              </li>
            </ul>
          </motion.div>

          {/* AGENCY / ENTERPRISE TIER - Bottom Row Spanning all 3 columns */}
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: 0.3 }}
             style={{
               gridColumn: '1 / -1',
               marginTop: '8px', 
               background: '#09090C',
               border: '1px solid rgba(255,255,255,0.06)',
               borderRadius: '0px',
               padding: '40px 48px',
               display: 'flex',
               flexWrap: 'wrap', 
               gap: '40px',
               alignItems: 'center',
               justifyContent: 'space-between',
               boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
             }}
          >

            {/* Left Side: Agency Pitch */}
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#FAFAFA', marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                Plan for agencies
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '24px', ...monoFont, maxWidth: '350px' }}>
                Need custom solutions, white-labeled client portals, or team management?
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.04em', ...monoFont }}>$49</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', ...monoFont }}>/ mo</span>
              </div>
              <button style={{
                padding: '12px 28px',
                borderRadius: '0px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#050505',
                background: '#FAFAFA',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#cccccc'}
              onMouseOut={(e) => e.currentTarget.style.background = '#FAFAFA'}
              >
                Contact Sales
              </button>
            </div>

            {/* Right Side: Features Grid */}
            <div style={{ flex: '2 1 400px' }}>
              <ul style={{ 
                listStyle: 'none', padding: 0, margin: 0, 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px',
              }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <RedCheck />
                  <span style={{ fontSize: '12px', color: '#FAFAFA', ...monoFont }}>Everything in Pro</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <RedCheck />
                  <span style={{ fontSize: '12px', color: '#FAFAFA', ...monoFont }}>5 team member seats</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <RedCheck />
                  <span style={{ fontSize: '12px', color: '#FAFAFA', ...monoFont }}>White-label client portals</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <RedCheck />
                  <span style={{ fontSize: '12px', color: '#FAFAFA', ...monoFont }}>Custom outreach limits</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <RedCheck />
                  <span style={{ fontSize: '12px', color: '#FAFAFA', ...monoFont }}>8% platform commission</span>
                </li>
              </ul>
            </div>

          </motion.div>

        </div>
      </div>

      <style>{`
        /* Responsive adjustments for 3-column brutalist grid */
        @media (max-width: 900px) {
          #pricing > div > div > div {
            grid-column: 1 / -1 !important; /* Force all to stack vertically */
          }
          /* Re-order so text appears first on mobile */
          #pricing > div > div > div:nth-child(2) {
            order: -1;
            padding: 0 0 32px 0 !important;
          }
        }
      `}</style>
    </section>
  )
}
