import { useRef } from 'react'
import { useReveal } from '../lib/useReveal'
import { insurance } from '../content'
import { InsuranceIcon } from '../components/Icons'
import './Insurance.css'

export default function Insurance() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section ref={root} className="section insurance" aria-labelledby="insurance-title">
      <div className="container insurance-grid">
        <header className="insurance-head">
          <p className="kicker" data-fade>
            <span className="num">vi.</span>
            <span className="rule" />
            Insurance
          </p>
          <h2 id="insurance-title" className="h2" data-split>
            Insurance <em>Accepted</em>
          </h2>
          <div className="insurance-shield" data-draw aria-hidden="true">
            <InsuranceIcon size={120} />
          </div>
        </header>

        <ul className="insurance-list" data-stagger="0.05">
          {insurance.map((name) => (
            <li key={name} className="insurer">
              <span className="insurer-dot" aria-hidden="true" />
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
