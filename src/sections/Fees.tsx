import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { gsap, useGSAP, prefersReducedMotion, isFinePointer } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { fees, legal, paymentMethods, practice, quotes } from '../content'
import { iconMap, SparkleIcon } from '../components/Icons'
import './Fees.css'

function TarotCard({ fee }: { fee: (typeof fees)[number] }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 150, damping: 18 })
  const ry = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 150, damping: 18 })
  const glare = useTransform([mx, my], ([x, y]: number[]) =>
    `radial-gradient(60% 50% at ${x * 100}% ${y * 100}%, rgba(236, 227, 214, 0.16), transparent 70%)`,
  )
  const Icon = iconMap[fee.icon]

  const onMove = (e: React.PointerEvent) => {
    if (!isFinePointer() || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const reset = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <div className="tarot-slot">
      <motion.div
        ref={ref}
        className="tarot"
        style={{ rotateX: rx, rotateY: ry }}
        onPointerMove={onMove}
        onPointerLeave={reset}
      >
        <div className="tarot-border" aria-hidden="true" />
        <span className="tarot-numeral">{fee.numeral}</span>
        <div className="tarot-emblem" data-draw>
          <span className="tarot-rays" aria-hidden="true" />
          <Icon size={64} />
        </div>
        <div className="tarot-text">
          <h3 className="tarot-name">{fee.name}</h3>
          <p className="tarot-note">{fee.note}</p>
        </div>
        <p className="tarot-price">{fee.price}</p>
        <motion.div className="tarot-glare" style={{ background: glare }} aria-hidden="true" />
      </motion.div>
    </div>
  )
}

export default function Fees() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const slots = q('.tarot-slot')
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        gsap.from(slots, {
          x: (i) => (1 - i) * 320,
          y: 120,
          rotate: (i) => (i - 1) * -14,
          autoAlpha: 0,
          duration: 1.5,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: { trigger: q('.tarot-row')[0], start: 'top 80%', once: true },
        })
      })
      mm.add('(max-width: 899px)', () => {
        slots.forEach((slot) =>
          gsap.from(slot, {
            y: 80,
            rotate: -4,
            autoAlpha: 0,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: { trigger: slot, start: 'top 88%', once: true },
          }),
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="fees" className="section fees" aria-labelledby="fees-title">
      <div className="container">
        <header className="section-head fees-head">
          <p className="kicker" data-fade>
            <span className="num">v.</span>
            <span className="rule" />
            Finances
          </p>
          <h2 id="fees-title" className="h2" data-split>
            Fees
          </h2>
        </header>

        <div className="tarot-row">
          {fees.map((f) => (
            <TarotCard key={f.numeral} fee={f} />
          ))}
        </div>

        <div className="fees-notes">
          <div className="fees-note" data-fade>
            <p className="kicker">
              <SparkleIcon size={10} /> Payment Methods
            </p>
            <p>{paymentMethods}</p>
          </div>
          <blockquote className="fees-quote" data-fade>
            <p>{quotes.billing}</p>
            <cite>— {practice.name}</cite>
          </blockquote>
          <div className="fees-note" data-fade>
            <p className="kicker">
              <SparkleIcon size={10} /> No Surprises Act
            </p>
            <p>
              {legal.goodFaith}{' '}
              <a href={practice.noSurprises} target="_blank" rel="noopener" className="link">
                Learn more
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
