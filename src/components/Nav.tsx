import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { nav, practice } from '../content'
import { useLenis, useScrollTo } from '../lib/smooth'
import { MoonPhases, PhoneIcon, PortalIcon } from './Icons'
import './Nav.css'

const ease = [0.76, 0, 0.24, 1] as const

export default function Nav({ ready }: { ready: boolean }) {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lenis = useLenis()
  const scrollTo = useScrollTo()

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 400)
        last = y
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (open) lenis?.stop()
    else if (ready) lenis?.start()
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, lenis, ready])

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    setTimeout(() => scrollTo(href), open ? 450 : 0)
  }

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: ready && (!hidden || open) ? 0 : -110 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="nav-inner">
          <a href="#home" className="nav-brand" onClick={go('#home')} aria-label={`${practice.name}, ${practice.credential} — home`}>
            <span className="nav-mono" aria-hidden="true">G</span>
            <span className="nav-brand-text">
              <span className="nav-name">{practice.name}</span>
              <span className="nav-cred">{practice.credential}</span>
            </span>
          </a>

          <nav className="nav-links" aria-label="Primary">
            {nav.map((item) => (
              <a key={item.href} href={item.href} onClick={go(item.href)} className="nav-link">
                <span data-text={item.label}>{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <a href={practice.phoneHref} className="nav-phone">
              <PhoneIcon size={15} />
              <span>{practice.phone}</span>
            </a>
            <a href={practice.portal} className="btn btn-ghost nav-portal" target="_blank" rel="noopener">
              <span className="btn-label">Client Portal</span>
            </a>
            <button
              className="nav-toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 36px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 36px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 36px)' }}
            transition={{ duration: 0.9, ease }}
          >
            <div className="menu-glow" aria-hidden="true" />
            <nav className="menu-links" aria-label="Mobile">
              {nav.map((item, i) => (
                <div className="menu-link-wrap" key={item.href}>
                  <motion.a
                    href={item.href}
                    onClick={go(item.href)}
                    className="menu-link"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-110%' }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="menu-index">0{i + 1}</span>
                    {item.label}
                  </motion.a>
                </div>
              ))}
            </nav>
            <motion.div
              className="menu-foot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <a href={practice.phoneHref} className="btn btn-primary">
                <PhoneIcon size={16} />
                <span className="btn-label">{practice.phone}</span>
              </a>
              <a href={practice.portal} className="btn btn-ghost" target="_blank" rel="noopener">
                <PortalIcon size={16} />
                <span className="btn-label">Client Portal</span>
              </a>
              <p className="menu-tag">{practice.tagline}</p>
              <MoonPhases />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
