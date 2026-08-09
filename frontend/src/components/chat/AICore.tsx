/**
 * AICore — Animated central orb that represents NEO's AI brain.
 * Used on the Home and Chat pages.
 */
import { motion } from 'framer-motion'
import { useSystemStore } from '../../store'

interface AICoreProps {
  size?: 'sm' | 'md' | 'lg'
  isThinking?: boolean
  onClick?: () => void
}

const SIZES = {
  sm: { outer: 120, inner: 56, fontSize: '1.2rem' },
  md: { outer: 180, inner: 84, fontSize: '1.6rem' },
  lg: { outer: 240, inner: 110, fontSize: '2rem' },
}

export function AICore({ size = 'lg', isThinking = false, onClick }: AICoreProps) {
  const { status } = useSystemStore()
  const isOnline = status?.ollamaStatus === 'online'
  const dims = SIZES[size]

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{ width: dims.outer, height: dims.outer }}
      onClick={onClick}
    >
      {/* Outermost pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: '1px solid rgba(0, 212, 255, 0.1)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbit ring 1 — cyan */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '10px',
          border: '1px solid rgba(0, 212, 255, 0.25)',
          borderTopColor: '#00d4ff',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Orbit ring 2 — purple dashed */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '22px',
          border: '1.5px dashed rgba(124, 58, 237, 0.35)',
          borderTopColor: '#7c3aed',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      />

      {/* Orbit ring 3 — blue */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '35px',
          border: '1px solid rgba(37, 99, 235, 0.25)',
          borderBottomColor: '#2563eb',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Thinking particle ring */}
      {isThinking && (
        <>
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: '#00d4ff',
                boxShadow: '0 0 6px rgba(0, 212, 255, 0.8)',
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos((angle * Math.PI) / 180) * (dims.outer / 2 - 8) - 3],
                y: [0, Math.sin((angle * Math.PI) / 180) * (dims.outer / 2 - 8) - 3],
                opacity: [1, 0.3, 1],
                scale: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      )}

      {/* Core orb */}
      <motion.div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: dims.inner,
          height: dims.inner,
          background: `radial-gradient(
            circle at 35% 35%,
            ${isOnline ? 'rgba(0,212,255,0.35)' : 'rgba(100,116,139,0.2)'},
            ${isOnline ? 'rgba(124,58,237,0.25)' : 'rgba(51,65,85,0.2)'},
            rgba(2,8,16,0.95)
          )`,
          boxShadow: isOnline
            ? `0 0 ${dims.inner * 0.5}px rgba(0,212,255,0.3),
               0 0 ${dims.inner}px rgba(0,212,255,0.1),
               inset 0 0 ${dims.inner * 0.3}px rgba(0,212,255,0.15)`
            : `0 0 20px rgba(100,116,139,0.1)`,
          border: `1px solid ${isOnline ? 'rgba(0,212,255,0.3)' : 'rgba(100,116,139,0.2)'}`,
        }}
        animate={
          isThinking
            ? {
                boxShadow: [
                  `0 0 ${dims.inner * 0.5}px rgba(0,212,255,0.3)`,
                  `0 0 ${dims.inner}px rgba(0,212,255,0.6)`,
                  `0 0 ${dims.inner * 0.5}px rgba(0,212,255,0.3)`,
                ],
              }
            : isOnline
            ? {
                boxShadow: [
                  `0 0 ${dims.inner * 0.4}px rgba(0,212,255,0.25)`,
                  `0 0 ${dims.inner * 0.6}px rgba(0,212,255,0.4)`,
                  `0 0 ${dims.inner * 0.4}px rgba(0,212,255,0.25)`,
                ],
              }
            : {}
        }
        transition={{ duration: isThinking ? 0.8 : 3, repeat: Infinity }}
      >
        {/* NEO text */}
        <span
          className="font-display font-bold select-none"
          style={{
            fontSize: dims.fontSize,
            color: isOnline ? '#00d4ff' : '#64748b',
            textShadow: isOnline
              ? `0 0 20px rgba(0,212,255,0.8), 0 0 40px rgba(0,212,255,0.4)`
              : 'none',
            letterSpacing: '0.1em',
          }}
        >
          NEO
        </span>
      </motion.div>

      {/* Status dot */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-1"
      >
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{
            background: isOnline ? '#10b981' : '#64748b',
            boxShadow: isOnline ? '0 0 6px rgba(16, 185, 129, 0.8)' : 'none',
          }}
          animate={isOnline ? { opacity: [1, 0.4, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  )
}
