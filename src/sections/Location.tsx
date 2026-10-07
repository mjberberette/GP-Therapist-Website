import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion, PLAY_ONCE } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { location, practice } from '../content'
import { TelehealthIcon } from '../components/Icons'
import './Location.css'

export default function Location() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      gsap.fromTo(
        q('.loc-rings'),
        { rotate: -40 },
        {
          rotate: 40,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
      const trigger = { trigger: q('.loc-visual')[0], start: 'top 80%', toggleActions: PLAY_ONCE }
      gsap.from(q('.loc-ring-path:not(.dashed)'), {
        drawSVG: 0,
        duration: 2.2,
        stagger: 0.15,
        ease: 'power2.inOut',
        scrollTrigger: trigger,
      })
      gsap.from(q('.loc-ring-path.dashed, .loc-tick'), {
        autoAlpha: 0,
        scale: 0.8,
        transformOrigin: '200px 200px',
        duration: 1.6,
        stagger: 0.01,
        ease: 'power3.out',
        scrollTrigger: trigger,
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="locations" className="section location" aria-labelledby="location-title">
      <div className="container location-grid">
        <div className="loc-copy">
          <p className="kicker" data-fade>
            <span className="num">vii.</span>
            <span className="rule" />
            Location
          </p>
          <h2 id="location-title" className="h2" data-split>
            Online appointments <em>only</em>
          </h2>
          <div className="loc-details" data-fade>
            <span className="loc-icon" data-draw>
              <TelehealthIcon size={40} />
            </span>
            <div>
              <p className="loc-label">{location.label}</p>
              <p className="loc-address">{location.address}</p>
            </div>
          </div>
          <p className="loc-tag" data-fade>
            {practice.tagline}
          </p>
        </div>

        <div className="loc-visual" aria-hidden="true">
          <svg className="loc-rings" viewBox="0 0 400 400" fill="none">
            <circle className="loc-ring-path" cx="200" cy="200" r="190" />
            <circle className="loc-ring-path dashed" cx="200" cy="200" r="150" />
            <circle className="loc-ring-path" cx="200" cy="200" r="105" />
            <circle className="loc-ring-path dashed" cx="200" cy="200" r="60" />
            <path className="loc-ring-path" d="M200 0v400M0 200h400" />
            {Array.from({ length: 36 }).map((_, i) => (
              <line
                key={i}
                x1="200"
                y1="4"
                x2="200"
                y2={i % 3 === 0 ? 20 : 12}
                transform={`rotate(${i * 10} 200 200)`}
                className="loc-tick"
              />
            ))}
          </svg>
          <div className="loc-pin">
            <span className="loc-pulse" />
            <span className="loc-pulse delay" />
            <span className="loc-dot" />
          </div>
          <span className="loc-coord">27.81° N · 82.70° W</span>
        </div>
      </div>
    </section>
  )
}
