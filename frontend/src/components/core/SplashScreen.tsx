/**
 * SplashScreen — Animated NEO intro with loading sequence.
 * Shows for ~3.5 seconds then calls onComplete().
 */
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  onComplete: () => void
}

const LOADING_STEPS = [
  'Initializing NEO Core...',
  'Loading AI Engine...',
  'Checking database...',
  'Scanning plugins...',
  'Starting voice engine...',
  'NEO is ready.',
]

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < LOADING_STEPS.length - 1) {
        currentStep++
        setStep(currentStep)
        setProgress(Math.round((currentStep / (LOADING_STEPS.length - 1)) * 100))
      } else {
        clearInterval(interval)
        setDone(true)
        setTimeout(onComplete, 800)
      }
    }, 480)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #040d1a 0%, #020810 70%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute inset-x-0 h-px opacity-20"
        style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)' }}
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* NEO Logo */}
      <motion.div
        className="relative mb-12"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Outer rings */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Ring 3 */}
          <motion.div
            className="absolute inset-0 rounded-full border opacity-20"
            style={{ borderColor: '#00d4ff' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          {/* Ring 2 */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 opacity-30"
            style={{ borderColor: '#7c3aed', borderStyle: 'dashed' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          {/* Ring 1 */}
          <motion.div
            className="absolute inset-8 rounded-full border-2 opacity-50"
            style={{ borderColor: '#00d4ff' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />

          {/* Core orb */}
          <motion.div
            className="relative w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 35% 35%, rgba(0,212,255,0.4), rgba(124,58,237,0.3), rgba(2,8,16,0.9))',
              boxShadow: '0 0 60px rgba(0, 212, 255, 0.4), 0 0 120px rgba(0, 212, 255, 0.1), inset 0 0 30px rgba(0, 212, 255, 0.2)',
            }}
            animate={{
              boxShadow: [
                '0 0 60px rgba(0, 212, 255, 0.4), 0 0 120px rgba(0, 212, 255, 0.1)',
                '0 0 80px rgba(0, 212, 255, 0.6), 0 0 160px rgba(0, 212, 255, 0.2)',
                '0 0 60px rgba(0, 212, 255, 0.4), 0 0 120px rgba(0, 212, 255, 0.1)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span
              className="font-display font-bold text-4xl tracking-wider"
              style={{ color: '#00d4ff', textShadow: '0 0 20px rgba(0, 212, 255, 0.8)' }}
            >
              NEO
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1
          className="font-display font-semibold text-xl tracking-[0.5em] uppercase mb-2"
          style={{ color: 'rgba(0, 212, 255, 0.7)' }}
        >
          Neural Executive Officer
        </h1>
        <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.8)' }}>
          AI Desktop Assistant v1.0
        </p>
      </motion.div>

      {/* Loading steps */}
      <motion.div
        className="w-80 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {/* Status text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            className="text-center text-sm font-mono"
            style={{ color: done ? '#00d4ff' : 'rgba(100, 116, 139, 0.9)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {LOADING_STEPS[step]}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div
          className="w-full h-0.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(0, 212, 255, 0.1)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #7c3aed, #00d4ff)',
              boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Progress percent */}
        <p
          className="text-center text-xs font-mono"
          style={{ color: 'rgba(100, 116, 139, 0.5)' }}
        >
          {progress}%
        </p>
      </motion.div>
    </motion.div>
  )
}
