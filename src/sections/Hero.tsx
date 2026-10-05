import { useRef } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion, isFinePointer } from '../lib/gsap'
import { useScrollTo } from '../lib/smooth'
import { hero, practice } from '../content'
import Arch from '../components/Arch'
import Embers from '../components/Embers'
import Magnetic from '../components/Magnetic'
import { ArrowIcon, CobwebCorner, MoonIcon, MoonPhases, PhoneIcon, SparkleIcon } from '../components/Icons'
import './Hero.css'

const ringText = `${practice.tagline} ✦ Ages 18+ ✦ `

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const scrollTo = useScrollTo()

  useGSAP(
    () => {
      if (!ready) return
      const reduce = prefersReducedMotion()
      const q = gsap.utils.selector(root)

      if (reduce) {
        gsap.set(q('.hero-reveal'), { autoAlpha: 1 })
        return
      }

      const splits = q('.hero-line-text').map((el) =>
        SplitText.create(el as HTMLElement, { type: 'chars', mask: 'chars', charsClass: 'hero-char' }),
      )

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.25 })
      tl.set(q('.hero-reveal'), { autoAlpha: 1 })
        .from(q('.hero-arch .arch-media'), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0)
        .from(q('.hero-arch img'), { scale: 1.45, duration: 2.2 }, 0.2)
        .from(q('.hero-arch .draw'), { drawSVG: 0, duration: 2, stagger: 0.2, ease: 'power2.inOut' }, 0.3)
        .from(splits[0].chars, { yPercent: 110, rotate: 8, duration: 1.4, stagger: 0.035 }, 0.55)
        .from(splits[1].chars, { yPercent: 110, rotate: -8, duration: 1.4, stagger: 0.035 }, 0.7)
        .from(splits[2].chars, { yPercent: 110, rotate: 8, duration: 1.4, stagger: 0.035 }, 0.85)
        .from(q('.hero-fade'), { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out' }, 1.2)
        .from(q('.hero-badge'), { scale: 0, rotate: -120, duration: 1.6 }, 1.1)
        .from(q('.hero-glow, .hero-embers'), { autoAlpha: 0, duration: 2.5, ease: 'power1.out' }, 0.4)
        .from(q('.hero-cobweb .draw'), { drawSVG: 0, duration: 2.4, stagger: 0.05, ease: 'power2.out' }, 1)

      const mm = gsap.matchMedia()
      mm.add('(min-width: 769px)', () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
          })
          .to(q('.hero-line-1'), { xPercent: -12, ease: 'none' }, 0)
          .to(q('.hero-line-2'), { xPercent: 8, ease: 'none' }, 0)
          .to(q('.hero-line-3'), { xPercent: 14, ease: 'none' }, 0)
          .to(q('.hero-arch'), { yPercent: 18, scale: 0.92, ease: 'none' }, 0)
          .to(q('.hero-arch img'), { scale: 1.15, ease: 'none' }, 0)
          .to(q('.hero-bottom'), { y: -60, autoAlpha: 0, ease: 'none' }, 0)
      })
      mm.add('(max-width: 768px)', () => {
        gsap.to(q('.hero-arch'), {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      })

      if (isFinePointer()) {
        const glowX = gsap.quickTo(q('.hero-glow')[0], 'x', { duration: 1.6, ease: 'power3' })
        const glowY = gsap.quickTo(q('.hero-glow')[0], 'y', { duration: 1.6, ease: 'power3' })
        const archX = gsap.quickTo(q('.hero-arch-tilt')[0], 'rotateY', { duration: 1.2, ease: 'power3' })
        const archY = gsap.quickTo(q('.hero-arch-tilt')[0], 'rotateX', { duration: 1.2, ease: 'power3' })
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          glowX(nx * window.innerWidth * 0.5)
          glowY(ny * window.innerHeight * 0.5)
          archX(nx * 10)
          archY(-ny * 8)
        }
        window.addEventListener('pointermove', onMove)
        return () => {
          window.removeEventListener('pointermove', onMove)
          mm.revert()
          splits.forEach((s) => s.revert())
        }
      }
      return () => {
        mm.revert()
        splits.forEach((s) => s.revert())
      }
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <section ref={root} id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero-glow" aria-hidden="true" />
      <Embers className="hero-embers" />
      <div className="hero-arches" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <CobwebCorner className="hero-cobweb" />

      <div className="hero-inner container">
        <div className="hero-top hero-reveal">
          <p className="hero-eyebrow hero-fade">
            <SparkleIcon size={10} />
            {practice.name}, {practice.credential}
            <span className="hero-pronouns">({practice.pronouns})</span>
          </p>
          <MoonPhases className="hero-phases hero-fade" />
        </div>

        <div className="hero-stage">
          <div className="hero-arch-wrap hero-reveal">
            <div className="hero-arch-tilt">
              <Arch className="hero-arch" src="/images/pt-photo.jpg" alt={`${practice.name}, ${practice.title}`} eager />
            </div>
          </div>

          <h1 id="hero-title" className="hero-title display hero-reveal" aria-label={hero.heading.join(' ')}>
            <span className="hero-line hero-line-1">
              <span className="hero-line-text">{hero.heading[0]}</span>
            </span>
            <span className="hero-line hero-line-2">
              <em className="hero-line-text">{hero.heading[1]}</em>
            </span>
            <span className="hero-line hero-line-3">
              <span className="hero-line-text">{hero.heading[2]}</span>
            </span>
          </h1>

          <button
            className="hero-badge hero-reveal"
            onClick={() => scrollTo('#about')}
            aria-label="Scroll to About"
            data-cursor="About"
          >
            <svg viewBox="0 0 200 200" className="hero-badge-ring" aria-hidden="true">
              <defs>
                <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
              </defs>
              <text>
                <textPath href="#badge-circle" textLength="488">
                  {ringText}
                </textPath>
              </text>
            </svg>
            <MoonIcon size={40} className="hero-badge-moon" />
          </button>
        </div>

        <div className="hero-bottom hero-reveal">
          <p className="hero-sub hero-fade">{hero.sub}</p>
          <div className="hero-ctas hero-fade">
            <Magnetic>
              <a href={practice.phoneHref} className="btn btn-primary" data-cursor="Call">
                <PhoneIcon size={16} />
                <span className="btn-label">{practice.phone}</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a href={practice.portal} className="btn btn-ghost" target="_blank" rel="noopener">
                <span className="btn-label">Client Portal</span>
                <ArrowIcon size={14} />
              </a>
            </Magnetic>
          </div>
          <div className="hero-scroll hero-fade" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </div>
        </div>
      </div>
    </section>
  )
}
