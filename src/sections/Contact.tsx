import { useRef } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { about, practice } from '../content'
import Magnetic from '../components/Magnetic'
import { ArrowIcon, PhoneIcon, SparkleIcon } from '../components/Icons'
import './Contact.css'

const splitAt = about.closing.lastIndexOf(',')
const lead = about.closing.slice(0, splitAt + 1)
const punch = about.closing.slice(splitAt + 1).trim()

export default function Contact() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const split = SplitText.create(q('.contact-punch')[0] as HTMLElement, { type: 'chars', mask: 'chars' })
      gsap.from(split.chars, {
        yPercent: 120,
        rotate: 12,
        stagger: 0.04,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.contact-punch')[0], start: 'top 85%', once: true },
      })
      gsap.fromTo(
        q('.contact-glow'),
        { scale: 0.6, opacity: 0 },
        {
          scale: 1.1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'center center', scrub: true },
        },
      )
      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="contact-glow" aria-hidden="true" />
      <div className="container contact-inner">
        <p className="contact-lead" data-split>
          {lead}
        </p>
        <h2 id="contact-title" className="contact-punch display">
          {punch}
        </h2>

        <div className="contact-actions" data-fade>
          <Magnetic strength={0.4}>
            <a href={practice.phoneHref} className="contact-orb" data-cursor="Call">
              <PhoneIcon size={26} />
              <span>{practice.phone}</span>
            </a>
          </Magnetic>
          <div className="contact-side">
            <p className="contact-consult">
              <SparkleIcon size={10} /> Free 15 minute consultation
            </p>
            <a href={practice.portal} className="btn btn-ghost" target="_blank" rel="noopener">
              <span className="btn-label">Client Portal</span>
              <ArrowIcon size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
