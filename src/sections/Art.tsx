import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, PLAY_ONCE } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { art } from '../content'
import './Art.css'

export default function Art() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)

      gsap.from(q('.art-eye .draw'), {
        drawSVG: 0,
        duration: 2,
        stagger: 0.1,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: q('.art-eye')[0], start: 'top 80%', toggleActions: PLAY_ONCE },
      })

      const light = q('.art-light')[0] as HTMLElement
      const lightSpan = () => (light.parentElement?.offsetWidth ?? 0) * 0.84
      gsap.set(light, { left: '8%', xPercent: -50 })
      const sweep = gsap.timeline({ repeat: -1, yoyo: true, paused: true, defaults: { duration: 1.1, ease: 'sine.inOut' } })
      sweep.fromTo(q('.art-iris'), { x: -34 }, { x: 34 }, 0).fromTo(light, { x: 0 }, { x: lightSpan }, 0)

      const blink = gsap
        .timeline({ repeat: -1, repeatDelay: 4.5, delay: 3, paused: true })
        .to(q('.art-lid'), { scaleY: 0.05, duration: 0.12, ease: 'power2.in', transformOrigin: '50% 50%' })
        .to(q('.art-lid'), { scaleY: 1, duration: 0.18, ease: 'power2.out' })

      ScrollTrigger.create({
        trigger: q('.art-eye')[0],
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => [sweep, blink].forEach((t) => (self.isActive ? t.play() : t.pause())),
        onRefresh: () => sweep.invalidate(),
      })

      gsap.fromTo(
        q('.art-strike'),
        { scaleX: 0 },
        {
          scaleX: 1,
          stagger: 0.4,
          ease: 'none',
          scrollTrigger: { trigger: q('.art-symptoms')[0], start: 'top 75%', end: 'bottom 40%', scrub: 0.5 },
        },
      )
      gsap.fromTo(
        q('.art-symptom-text'),
        { opacity: 1 },
        {
          opacity: 0.38,
          stagger: 0.4,
          ease: 'none',
          scrollTrigger: { trigger: q('.art-symptoms')[0], start: 'top 75%', end: 'bottom 40%', scrub: 0.5 },
        },
      )

      gsap.from(q('.art-num'), {
        yPercent: 60,
        autoAlpha: 0,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.art-relief')[0], start: 'top 85%', toggleActions: PLAY_ONCE },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section art" aria-labelledby="art-title">
      <div className="container art-grid">
        <div className="art-visual">
          <div className="art-eye-wrap">
            <svg className="art-eye" viewBox="0 0 320 200" fill="none" aria-hidden="true">
              <g className="art-lid">
                <path className="draw" d="M10 100C60 30 110 10 160 10s100 20 150 90c-50 70-100 90-150 90S60 170 10 100Z" />
                <g className="art-iris">
                  <circle className="draw" cx="160" cy="100" r="46" />
                  <circle className="draw" cx="160" cy="100" r="30" />
                  <circle cx="160" cy="100" r="16" fill="currentColor" />
                  <circle cx="150" cy="90" r="5" fill="var(--bone)" />
                </g>
              </g>
              <path className="draw" d="M100 18l-8-14M220 18l8-14M50 44L36 30M270 44l14-14M160 10V-6" />
            </svg>
            <div className="art-track" aria-hidden="true">
              <span className="art-light" />
            </div>
          </div>
        </div>

        <div className="art-content">
          <p className="kicker" data-fade>
            <span className="num">ii.</span>
            <span className="rule" />
            {art.short}
          </p>
          <h2 id="art-title" className="h2" data-split>
            Accelerated <em>Resolution</em> Therapy
          </h2>
          <p className="body-text art-body" data-fade>
            {art.body}
          </p>

          <ul className="art-symptoms" aria-label="Symptoms ART can help reduce">
            {art.symptoms.map((s) => (
              <li key={s} className="art-symptom">
                <span className="art-symptom-text">{s}</span>
                <span className="art-strike" aria-hidden="true" />
              </li>
            ))}
          </ul>

          <div className="art-relief">
            <span className="art-num" aria-hidden="true">
              1–5
            </span>
            <p data-fade>{art.relief}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
