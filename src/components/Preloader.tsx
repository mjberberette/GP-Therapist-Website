import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react'
import { prefersReducedMotion } from '../lib/gsap'
import { practice } from '../content'
import { MoonPhases } from './Icons'
import './Preloader.css'

const ease = [0.76, 0, 0.24, 1] as const

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [done, setDone] = useState(false)
  const count = useMotionValue(0)
  const label = useTransform(count, (v) => String(Math.round(v)).padStart(3, '0'))
  const ring = useTransform(count, (v) => v / 100)

  useEffect(() => {
    const reduce = prefersReducedMotion()
    let cancelled = false
    const controls = animate(count, 100, { duration: reduce ? 0.2 : 2.1, ease: [0.65, 0, 0.35, 1] })
    Promise.all([controls, document.fonts?.ready ?? Promise.resolve()]).then(() => {
      if (!cancelled) setTimeout(() => setDone(true), reduce ? 0 : 250)
    })
    const failsafe = setTimeout(() => setDone(true), 5000)
    return () => {
      cancelled = true
      clearTimeout(failsafe)
      controls.stop()
    }
  }, [count])

  useEffect(() => {
    if (done) onComplete()
  }, [done, onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="preloader"
          role="status"
          aria-label="Loading"
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 1.1, ease }}
        >
          <motion.div
            className="preloader-inner"
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="preloader-mark">
              <svg viewBox="0 0 120 120" className="preloader-ring" aria-hidden="true">
                <circle cx="60" cy="60" r="56" className="track" />
                <motion.circle cx="60" cy="60" r="56" className="progress" style={{ pathLength: ring }} />
              </svg>
              <motion.span
                className="preloader-g"
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                G
              </motion.span>
            </div>
            <motion.p
              className="preloader-name"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {practice.name}, {practice.credential}
            </motion.p>
            <MoonPhases className="preloader-phases" />
          </motion.div>
          <motion.span className="preloader-count" aria-hidden="true">
            {label}
          </motion.span>
          <span className="preloader-tag" aria-hidden="true">
            {practice.tagline}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
