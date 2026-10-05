import { useRef } from 'react'
import { useReveal } from '../lib/useReveal'
import { services } from '../content'
import { SparkleIcon } from '../components/Icons'
import './Services.css'

export default function Services() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section ref={root} id="services" className="section services" aria-labelledby="services-title">
      <div className="container">
        <header className="section-head services-head">
          <p className="kicker" data-fade>
            <span className="num">iii.</span>
            <span className="rule" />
            Services
          </p>
          <h2 id="services-title" className="h2" data-split>
            Helping people <em>navigate:</em>
          </h2>
        </header>

        <ol className="services-list" data-stagger="0.035">
          {services.list.map((item, i) => (
            <li key={item} className="service">
              <span className="service-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="service-name">{item}</span>
              <SparkleIcon size={14} className="service-mark" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
