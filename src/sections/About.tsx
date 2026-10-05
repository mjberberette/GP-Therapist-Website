import { useRef } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { about, practice, topSpecialties } from '../content'
import Arch from '../components/Arch'
import { CobwebCorner, iconMap, SparkleIcon } from '../components/Icons'
import './About.css'

export default function About() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)

      const split = SplitText.create(q('.about-intro')[0] as HTMLElement, { type: 'words', wordsClass: 'about-word' })
      gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: q('.about-intro')[0], start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
        },
      )

      gsap.fromTo(
        q('.about-photo img'),
        { yPercent: -8, scale: 1.18 },
        {
          yPercent: 8,
          scale: 1.18,
          ease: 'none',
          scrollTrigger: { trigger: q('.about-photo')[0], start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )

      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="about" className="section about" aria-labelledby="about-title">
      <CobwebCorner className="about-cobweb" />
      <div className="container">
        <header className="section-head about-head">
          <p className="kicker" data-fade>
            <span className="num">i.</span>
            <span className="rule" />
            {about.kicker}
          </p>
          <h2 id="about-title" className="h2" data-split>
            Real, down-to-earth <em>therapy</em>
          </h2>
        </header>

        <p className="about-intro lede">{about.intro}</p>

        <div className="about-grid">
          <aside className="about-aside">
            <div className="about-sticky">
              <Arch className="about-photo" src="/images/headshot.jpg" alt={practice.name} />
              <div className="about-caption" data-fade>
                <span className="about-caption-name">{practice.name}</span>
                <span className="about-caption-title">{practice.title}</span>
              </div>
            </div>
          </aside>

          <div className="about-body">
            {about.paragraphs.map((p, i) => (
              <p key={i} className="body-text about-p" data-fade>
                {i === 0 && <span className="dropcap" aria-hidden="true">{p[0]}</span>}
                {i === 0 ? <><span className="sr-only">{p[0]}</span>{p.slice(1)}</> : p}
              </p>
            ))}

            <div className="about-specialties" data-fade>
              <p className="kicker">
                <SparkleIcon size={10} /> Top Specialties
              </p>
              <ul className="about-spec-list">
                {topSpecialties.map((s) => {
                  const Icon = iconMap[s.icon]
                  return (
                    <li key={s.title} className="about-spec" data-draw>
                      <Icon size={40} />
                      <span>{s.title}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
