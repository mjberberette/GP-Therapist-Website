import { useRef } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { legal, nav, practice } from '../content'
import { useScrollTo } from '../lib/smooth'
import { MoonPhases } from '../components/Icons'
import './Footer.css'

export default function Footer() {
  const root = useRef<HTMLElement>(null)
  const scrollTo = useScrollTo()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const split = SplitText.create(q('.footer-word')[0] as HTMLElement, { type: 'chars', mask: 'chars' })
      gsap.from(split.chars, {
        yPercent: 100,
        stagger: 0.03,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.footer-word')[0], start: 'top 98%', once: true },
      })

      const glow = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } })
      glow
        .from(q('.footer-glow-orb'), { autoAlpha: 0, yPercent: 30, scale: 0.8, duration: 1.8, ease: 'power3.out' })
        .from(q('.footer-glow-arches'), { autoAlpha: 0, y: 80, duration: 1.4, ease: 'power3.out' }, 0.2)
        .to(q('.footer-glow-orb'), { opacity: 0.72, scaleX: 1.06, duration: 4, ease: 'sine.inOut', repeat: -1, yoyo: true })
      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <footer ref={root} className="footer">
      <svg width="0" height="0" className="footer-defs" aria-hidden="true">
        <filter id="footer-outline" x="-5%" y="-5%" width="110%" height="110%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="1.2" result="grown" />
          <feComposite in="grown" in2="SourceAlpha" operator="out" result="ring" />
          <feFlood floodColor="#ece3d6" floodOpacity="0.42" />
          <feComposite in2="ring" operator="in" />
        </filter>
      </svg>
      <div className="footer-glow" aria-hidden="true">
        <div className="footer-glow-arches" />
        <div className="footer-glow-orb" />
      </div>
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/images/logo.png" alt="Genevieve Piché, LCSW logo" width="96" height="96" loading="lazy" />
            <div>
              <p className="footer-name">
                {practice.name}, {practice.credential}
              </p>
              <p className="footer-tag">{practice.tagline}</p>
              <a href={practice.phoneHref} className="footer-phone link">
                {practice.phone}
              </a>
            </div>
          </div>

          <nav className="footer-col" aria-label="Footer">
            <p className="footer-head">Explore</p>
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="footer-link"
                onClick={(e) => {
                  e.preventDefault()
                  scrollTo(n.href)
                }}
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="footer-col">
            <p className="footer-head">Clients</p>
            <a href={practice.portal} className="footer-link" target="_blank" rel="noopener">
              Client Portal
            </a>
            <a href={practice.privacyNotice} className="footer-link" target="_blank" rel="noopener">
              Notice of Privacy Practices
            </a>
            <a href={practice.noSurprises} className="footer-link" target="_blank" rel="noopener">
              No Surprises Act
            </a>
          </div>

          <div className="footer-col">
            <p className="footer-head">Main Location</p>
            <p className="footer-text">{practice.city}</p>
            <p className="footer-text footer-small">{legal.goodFaith}</p>
          </div>
        </div>

        <p className="footer-emergency" role="note">
          {legal.emergency}
        </p>

        <div className="footer-word display" aria-hidden="true">
          Genevieve Piché
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {practice.business}
          </span>
          <MoonPhases />
          <button className="footer-top-btn" onClick={() => scrollTo('#home')}>
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
