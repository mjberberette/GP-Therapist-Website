import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { approaches } from '../content'
import { CandleIcon, EyeIcon, HeartIcon, KeyIcon, MoonIcon } from '../components/Icons'
import './Approaches.css'

const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII']
const cardIcons = [CandleIcon, HeartIcon, KeyIcon, MoonIcon, EyeIcon]

export default function Approaches() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const track = q('.approaches-track')[0] as HTMLElement
      const bar = q('.approaches-progress i')[0] as HTMLElement

      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => track.scrollWidth - window.innerWidth
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: q('.approaches-pin')[0],
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
          },
        })
        q('.approach').forEach((card) => {
          gsap.from(card.querySelector('.approach-inner'), {
            rotate: 6,
            y: 60,
            autoAlpha: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: 'left 95%',
              end: 'left 55%',
              scrub: true,
            },
          })
        })
      })

      mm.add('(max-width: 899px)', () => {
        const count = q('.approaches-count')[0] as HTMLElement
        const cards = q('.approach') as HTMLElement[]
        const onScroll = () => {
          const max = track.scrollWidth - track.clientWidth
          const p = max > 0 ? track.scrollLeft / max : 0
          gsap.set(bar, { scaleX: p })
          const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1
          const i = p >= 0.995 ? cards.length - 1 : Math.round(track.scrollLeft / step)
          count.textContent = String(Math.min(i, cards.length - 1) + 1).padStart(2, '0')
        }
        track.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
        return () => track.removeEventListener('scroll', onScroll)
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="approaches" aria-labelledby="approaches-title">
      <div className="approaches-pin">
        <div className="container approaches-head">
          <p className="kicker" data-fade>
            <span className="num">iv.</span>
            <span className="rule" />
            Treatment Approach
          </p>
          <h2 id="approaches-title" className="h2" data-split>
            Approaches
          </h2>
          <div className="approaches-meta" aria-hidden="true">
            <p className="approaches-swipe">
              <span className="approaches-count">01</span> / {String(approaches.length).padStart(2, '0')}
              <span className="approaches-swipe-label">Tap or swipe</span>
            </p>
            <div className="approaches-progress">
              <i />
            </div>
          </div>
        </div>

        <ul className="approaches-track" tabIndex={0} aria-label="Therapy approaches">
          {approaches.map((a, i) => {
            const Icon = cardIcons[i % cardIcons.length]
            return (
              <li key={a.name} className="approach">
                <div
                  className="approach-inner"
                  tabIndex={0}
                  onClick={(e) => e.currentTarget.classList.toggle('is-open')}
                  onBlur={(e) => e.currentTarget.classList.remove('is-open')}
                >
                  <span className="approach-numeral">{numerals[i]}</span>
                  <div className="approach-body">
                    <Icon size={56} className="approach-icon" />
                    <p className="approach-desc">{a.desc}</p>
                  </div>
                  <h3 className="approach-name">{a.name}</h3>
                  <span className="approach-corner" aria-hidden="true" />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
