import { useRef } from 'react'
import { useReveal } from '../lib/useReveal'
import { useScrollTo } from '../lib/smooth'
import { badges, consultation, practice } from '../content'
import Magnetic from '../components/Magnetic'
import { ArrowIcon, DoorIcon, PhoneIcon } from '../components/Icons'
import './ConsultCta.css'

const accepting = badges.find((b) => b.icon === 'door')

export default function ConsultCta() {
  const root = useRef<HTMLElement>(null)
  const scrollTo = useScrollTo()
  useReveal(root)

  return (
    <section ref={root} className="consult" aria-labelledby="consult-title">
      <div className="container">
        <div className="consult-card" data-fade>
          <div className="consult-icon" data-draw>
            <DoorIcon size={64} />
          </div>
          <div className="consult-copy">
            {accepting && (
              <p className="consult-kicker">
                {accepting.top} {accepting.bottom}
              </p>
            )}
            <h2 id="consult-title" className="consult-title">
              {consultation}
            </h2>
          </div>
          <div className="consult-actions">
            <Magnetic>
              <a
                href="#contact-form"
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault()
                  scrollTo('#contact-form')
                }}
              >
                <span className="btn-label">Contact me</span>
                <ArrowIcon size={14} />
              </a>
            </Magnetic>
            <a href={practice.phoneHref} className="btn btn-ghost" data-cursor="Call">
              <PhoneIcon size={16} />
              <span className="btn-label">{practice.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
