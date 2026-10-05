import { useRef } from 'react'
import { badges } from '../content'
import { iconMap } from '../components/Icons'
import { useReveal } from '../lib/useReveal'
import './Badges.css'

export default function Badges() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section ref={root} className="badges" aria-label="Practice details">
      <ul className="badges-grid container" data-stagger="0.1">
        {badges.map((b) => {
          const Icon = iconMap[b.icon]
          return (
            <li key={b.bottom} className="badge" data-draw>
              <span className="badge-icon">
                <Icon size={44} />
              </span>
              <span className="badge-text">
                <span className="badge-top">{b.top}</span>
                <span className="badge-bottom">{b.bottom}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
