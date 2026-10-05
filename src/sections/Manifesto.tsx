import { useRef } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { quotes } from '../content'
import { CandleIcon } from '../components/Icons'
import './Manifesto.css'

const [lead, ...rest] = quotes.taboo.split('. ')
const tail = rest.join('. ')

export default function Manifesto() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const split = SplitText.create(q('.manifesto-big')[0] as HTMLElement, { type: 'words,chars' })

      const mm = gsap.matchMedia()
      mm.add({ desktop: '(min-width: 769px)', mobile: '(max-width: 768px)' }, (ctx) => {
        const desktop = ctx.conditions?.desktop
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: desktop ? 'top top' : 'top 70%',
            end: desktop ? '+=140%' : 'bottom 60%',
            scrub: 0.8,
            pin: desktop ? q('.manifesto-pin')[0] : false,
          },
        })
        tl.from(q('.manifesto-lead'), { autoAlpha: 0, y: 30, duration: 0.3 })
          .fromTo(split.chars, { opacity: 0.08 }, { opacity: 1, stagger: 0.02, duration: 0.3 }, 0.2)
          .from(q('.manifesto-candle'), { scale: 0.6, autoAlpha: 0, duration: 0.4 }, 0)
          .to(q('.manifesto-glow'), { scale: 1.4, opacity: 1, duration: 1 }, 0)
      })

      gsap.to(q('.manifesto-candle .flame'), {
        scaleY: 1.12,
        scaleX: 0.92,
        transformOrigin: '50% 100%',
        duration: 0.35,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      return () => {
        mm.revert()
        split.revert()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} className="manifesto" aria-label="Approach">
      <div className="manifesto-pin">
        <div className="manifesto-glow" aria-hidden="true" />
        <div className="container manifesto-inner">
          <CandleIcon size={56} className="manifesto-candle" />
          <p className="manifesto-lead">{lead}.</p>
          <p className="manifesto-big display">{tail}</p>
        </div>
      </div>
    </section>
  )
}
