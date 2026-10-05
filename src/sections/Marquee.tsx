import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { services } from '../content'
import { SparkleIcon } from '../components/Icons'
import './Marquee.css'

const half = Math.ceil(services.list.length / 2)
const rows = [services.list.slice(0, half), services.list.slice(half)]

export default function Marquee() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const tracks = gsap.utils.toArray<HTMLElement>('.marquee-track', root.current)
      const loops = tracks.map((track, i) => {
        const dir = i % 2 === 0 ? -1 : 1
        return gsap.fromTo(
          track,
          { xPercent: dir < 0 ? 0 : -50 },
          { xPercent: dir < 0 ? -50 : 0, duration: 48 + i * 8, ease: 'none', repeat: -1 },
        )
      })

      const skew = gsap.quickTo(tracks, 'skewX', { duration: 0.6, ease: 'power3' })
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity()
          const boost = 1 + Math.min(Math.abs(v) / 300, 5)
          loops.forEach((l) => gsap.to(l, { timeScale: boost, duration: 0.3, overwrite: true }))
          skew(gsap.utils.clamp(-8, 8, v / -200))
        },
        onLeave: () => loops.forEach((l) => l.pause()),
        onEnterBack: () => loops.forEach((l) => l.resume()),
        onLeaveBack: () => loops.forEach((l) => l.pause()),
        onEnter: () => loops.forEach((l) => l.resume()),
      })

      const settle = () => {
        loops.forEach((l) => gsap.to(l, { timeScale: 1, duration: 1, overwrite: true }))
        skew(0)
      }
      ScrollTrigger.addEventListener('scrollEnd', settle)
      return () => ScrollTrigger.removeEventListener('scrollEnd', settle)
    },
    { scope: root },
  )

  return (
    <div ref={root} className="marquee" aria-label={services.heading}>
      {rows.map((row, i) => (
        <div key={i} className={`marquee-row ${i === 1 ? 'is-outline' : ''}`} aria-hidden={i === 1}>
          <div className="marquee-track">
            {[0, 1].map((dup) =>
              row.map((item) => (
                <span className="marquee-item" key={`${dup}-${item}`} aria-hidden={dup === 1}>
                  {item}
                  <SparkleIcon size={18} />
                </span>
              )),
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
