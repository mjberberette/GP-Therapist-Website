import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion, PLAY_ONCE } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { credentials } from '../content'
import './Credentials.css'

export default function Credentials() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const counter = root.current!.querySelector<HTMLElement>('[data-count]')
      if (!counter) return
      const target = Number(counter.dataset.count)
      const obj = { v: 0 }
      gsap.to(obj, {
        v: target,
        duration: 2,
        ease: 'power3.out',
        onUpdate: () => (counter.textContent = String(Math.round(obj.v))),
        scrollTrigger: { trigger: counter, start: 'top 90%', toggleActions: PLAY_ONCE },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="credentials" aria-labelledby="credentials-title">
      <h2 id="credentials-title" className="sr-only">
        Education and Years In Practice
      </h2>
      <ul className="container credentials-grid" data-stagger="0.1">
        {credentials.map((c) => {
          const numeric = /^\d+$/.test(c.value)
          return (
            <li key={c.label} className="credential">
              <span className="credential-value" data-count={numeric ? c.value : undefined}>
                {c.value}
              </span>
              <span className="credential-label">{c.label}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
