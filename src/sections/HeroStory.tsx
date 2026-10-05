import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { useScrollTo } from '../lib/smooth'
import { hero, practice, story } from '../content'
import Magnetic from '../components/Magnetic'
import { ArrowIcon, PhoneIcon, RoseIcon, SparkleIcon } from '../components/Icons'
import type { RoseScene } from '../three/RoseScene'
import './HeroStory.css'

const ringText = `${practice.tagline} ✦ Ages 18+ ✦ `
const numerals = ['I', 'II', 'III', 'IV', 'V']

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function HeroStory({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<RoseScene | null>(null)
  const chapterAt = useRef<number[]>([])
  const [glReady, setGlReady] = useState(false)
  const [noGL, setNoGL] = useState(false)
  const [chapter, setChapter] = useState(0)
  const [reduced] = useState(prefersReducedMotion)
  const scrollTo = useScrollTo()

  useEffect(() => {
    if (!hasWebGL()) {
      setNoGL(true)
      return
    }
    let disposed = false
    let instance: RoseScene | null = null
    const mobile = window.matchMedia('(max-width: 768px)').matches

    import('../three/RoseScene').then(({ RoseScene }) => {
      if (disposed || !canvas.current) return
      try {
        instance = new RoseScene(canvas.current, { mobile })
      } catch {
        setNoGL(true)
        return
      }
      instance.onFirstFrame = () => setGlReady(true)
      if (reduced) instance.renderStatic(0.55)
      scene.current = instance
      ScrollTrigger.refresh()
    })

    const onResize = () => scene.current?.resize()
    window.addEventListener('resize', onResize)
    const io = new IntersectionObserver(([e]) => scene.current?.setVisible(e.isIntersecting))
    if (root.current) io.observe(root.current)

    return () => {
      disposed = true
      window.removeEventListener('resize', onResize)
      io.disconnect()
      instance?.dispose()
      scene.current = null
    }
  }, [reduced])

  useGSAP(
    () => {
      if (!ready) return
      const q = gsap.utils.selector(root)

      if (reduced) {
        gsap.set(q('.story-reveal'), { autoAlpha: 1 })
        return
      }

      const titleSplits = q('.story-title-line').map((el) =>
        SplitText.create(el as HTMLElement, { type: 'chars', mask: 'chars' }),
      )
      const intro = gsap.timeline({ delay: 0.2, defaults: { ease: 'expo.out' } })
      intro
        .set(q('.story-reveal'), { autoAlpha: 1 })
        .from(q('.story-canvas, .story-fallback'), { autoAlpha: 0, scale: 1.08, duration: 2.4, ease: 'power2.out' }, 0)
        .from(titleSplits[0].chars, { yPercent: 115, rotate: 6, duration: 1.4, stagger: 0.035 }, 0.4)
        .from(titleSplits[1].chars, { yPercent: 115, rotate: -6, duration: 1.4, stagger: 0.035 }, 0.55)
        .from(titleSplits[2].chars, { yPercent: 115, rotate: 6, duration: 1.4, stagger: 0.035 }, 0.7)
        .from(q('.story-intro-fade'), { y: 24, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out' }, 1.1)
        .from(q('.story-badge'), { scale: 0, rotate: -120, duration: 1.6 }, 1)

      const tabooSplit = SplitText.create(q('.beat-taboo-text')[0] as HTMLElement, { type: 'words', mask: 'words' })
      const changeSplit = SplitText.create(q('.beat-change-text')[0] as HTMLElement, { type: 'words' })

      const beats = q('.beat')
      gsap.set(beats.slice(1), { autoAlpha: 0 })

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      tl.to(beats[0], { autoAlpha: 0, y: -80, filter: 'blur(12px)', duration: 0.8 }, 0.7)
        .to(q('.story-badge'), { autoAlpha: 0, scale: 0.6, duration: 0.6 }, 0.6)

        .fromTo(beats[1], { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.6)
        .from(q('.beat-word'), { yPercent: 120, autoAlpha: 0, duration: 0.5, stagger: 0.45, ease: 'expo.out' }, 2)
        .to(beats[1], { autoAlpha: 0, y: -60, filter: 'blur(10px)', duration: 0.6 }, 4.1)

        .set(beats[2], { autoAlpha: 1 }, 4.7)
        .from(tabooSplit.words, { yPercent: 110, duration: 0.7, stagger: 0.07, ease: 'expo.out' }, 4.7)
        .from(q('.beat-taboo .story-rose'), { scale: 0, rotate: -90, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)' }, 4.7)
        .to(beats[2], { autoAlpha: 0, scale: 1.08, filter: 'blur(10px)', duration: 0.6 }, 6.4)

        .fromTo(beats[3], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 7)
        .fromTo(changeSplit.words, { opacity: 0.1 }, { opacity: 1, stagger: 0.08, duration: 0.3, ease: 'none' }, 7)
        .from(q('.beat-walk'), { y: 30, autoAlpha: 0, duration: 0.5 }, 7.8)
        .to(beats[3], { autoAlpha: 0, y: -60, filter: 'blur(10px)', duration: 0.6 }, 8.6)

        .fromTo(beats[4], { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 9.1)
        .from(q('.beat-final > *'), { y: 30, autoAlpha: 0, stagger: 0.12, duration: 0.6, ease: 'expo.out' }, 9.2)
        .to(q('.story-shade-final'), { autoAlpha: 1, duration: 0.8 }, 9)
        .to({}, { duration: 0.6 })

      chapterAt.current = [0, 1.6, 4.7, 7, 9.1].map((t) => t / tl.duration())

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        animation: tl,
        onUpdate: (self) => {
          scene.current?.setProgress(self.progress)
          root.current?.style.setProperty('--story-p', String(self.progress))
          let c = 0
          chapterAt.current.forEach((t, i) => self.progress >= t - 0.01 && (c = i))
          setChapter(c)
        },
      })

      return () => {
        titleSplits.forEach((s) => s.revert())
        tabooSplit.revert()
        changeSplit.revert()
      }
    },
    { scope: root, dependencies: [ready] },
  )

  const jumpTo = (i: number) => {
    const el = root.current
    if (!el) return
    const at = chapterAt.current[i] ?? 0
    const settle = i === 0 ? 0 : 0.035
    scrollTo(el.offsetTop + (el.offsetHeight - window.innerHeight) * Math.min(1, at + settle))
  }

  return (
    <section
      ref={root}
      id="home"
      className={`story ${reduced ? 'is-static' : ''}`}
      aria-labelledby="hero-title"
    >
      <div className="story-sticky">
        {!noGL && <canvas ref={canvas} className={`story-canvas ${glReady ? 'is-ready' : ''}`} aria-hidden="true" />}
        {noGL && (
          <div className="story-fallback" aria-hidden="true">
            <RoseIcon size={320} />
          </div>
        )}
        <div className="story-shade" aria-hidden="true" />
        <div className="story-shade-final" aria-hidden="true" />

        <div className="story-beats container">
          <div className="beat beat-intro story-reveal">
            <p className="story-eyebrow story-intro-fade">
              <SparkleIcon size={10} />
              {practice.name}, {practice.credential}
              <span className="story-pronouns">({practice.pronouns})</span>
            </p>
            <h1 id="hero-title" className="story-title display" aria-label={hero.heading.join(' ')}>
              <span className="story-title-line">{hero.heading[0]}</span>
              <em className="story-title-line">{hero.heading[1]}</em>
              <span className="story-title-line">{hero.heading[2]}</span>
            </h1>
            <div className="story-scroll story-intro-fade" aria-hidden="true">
              <i />
              <span>Scroll</span>
            </div>
          </div>

          <div className="beat beat-unfurl" aria-hidden={chapter !== 1}>
            <p className="beat-lead">{story.showUp}</p>
            <p className="beat-words display">
              {story.words.map((w) => (
                <span className="beat-word-mask" key={w}>
                  <span className="beat-word">{w}</span>
                </span>
              ))}
            </p>
          </div>

          <div className="beat beat-taboo" aria-hidden={chapter !== 2}>
            <RoseIcon size={56} className="story-rose" />
            <p className="beat-taboo-text display">{story.taboo}</p>
          </div>

          <div className="beat beat-change" aria-hidden={chapter !== 3}>
            <p className="beat-change-text display">{story.change}</p>
            <p className="beat-walk">{story.walk}</p>
          </div>

          <div className="beat beat-final" aria-hidden={chapter !== 4 && !reduced}>
            <p className="kicker">
              <SparkleIcon size={10} /> {practice.tagline}
            </p>
            <p className="beat-final-sub">{hero.sub}</p>
            <div className="beat-ctas">
              <Magnetic>
                <a href={practice.phoneHref} className="btn btn-primary" data-cursor="Call">
                  <PhoneIcon size={16} />
                  <span className="btn-label">{practice.phone}</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a href={practice.portal} className="btn btn-ghost" target="_blank" rel="noopener">
                  <span className="btn-label">Client Portal</span>
                  <ArrowIcon size={14} />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        <button
          className="story-badge story-reveal"
          onClick={() => jumpTo(1)}
          aria-label="Begin the story"
          data-cursor="Scroll"
        >
          <svg viewBox="0 0 200 200" className="story-badge-ring" aria-hidden="true">
            <defs>
              <path id="story-badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text>
              <textPath href="#story-badge-circle" textLength="488">
                {ringText}
              </textPath>
            </text>
          </svg>
          <RoseIcon size={44} className="story-badge-rose" />
        </button>

        {!reduced && (
          <nav className="story-chapters story-reveal" aria-label="Story chapters">
            {story.chapters.map((c, i) => (
              <button
                key={c}
                className={`story-chapter ${chapter === i ? 'is-active' : ''}`}
                onClick={() => jumpTo(i)}
                aria-current={chapter === i ? 'step' : undefined}
              >
                <span className="story-chapter-num">{numerals[i]}</span>
                <span className="story-chapter-name">{c}</span>
              </button>
            ))}
            <span className="story-progress" aria-hidden="true">
              <i />
            </span>
          </nav>
        )}
      </div>
    </section>
  )
}
