import type { RefObject } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion, PLAY_ONCE } from './gsap'

/**
 * Scroll reveals for a section. Inside `scope`:
 *  [data-split]  heading lines rise out of a mask
 *  [data-fade]   element fades up (data-delay optional)
 *  [data-stagger] direct children stagger in
 *  [data-draw]   SVG `.draw` strokes ink in
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const root = scope.current!

      // The trigger lives outside onSplit because autoSplit re-runs onSplit on resize.
      root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        let tween: gsap.core.Tween | null = null
        let revealed = false
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit: (self) => {
            if (revealed) return
            tween = gsap.from(self.lines, {
              yPercent: 135,
              rotate: 2,
              duration: 1.2,
              stagger: 0.09,
              ease: 'expo.out',
              paused: true,
            })
            return tween
          },
        })
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          onEnter: () => {
            revealed = true
            tween?.play()
          },
        })
      })

      root.querySelectorAll<HTMLElement>('[data-fade]').forEach((el) => {
        gsap.from(el, {
          y: 40,
          autoAlpha: 0,
          duration: 1.1,
          delay: Number(el.dataset.delay ?? 0),
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: PLAY_ONCE },
        })
      })

      root.querySelectorAll<HTMLElement>('[data-stagger]').forEach((el) => {
        gsap.from(el.children, {
          y: 30,
          autoAlpha: 0,
          duration: 0.9,
          stagger: Number(el.dataset.stagger || 0.06),
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: PLAY_ONCE },
        })
      })

      root.querySelectorAll<HTMLElement>('[data-draw]').forEach((el) => {
        const paths = el.querySelectorAll('.draw')
        if (!paths.length) return
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: PLAY_ONCE } })
        tl.from(paths, { drawSVG: 0, duration: 1.6, stagger: 0.08, ease: 'power2.inOut' })
        const icons = el.querySelectorAll('.icon')
        if (icons.length)
          tl.from(icons, { color: '#e5576f', duration: 1.8, ease: 'power2.inOut', clearProps: 'color' }, 0.9)
      })
    },
    { scope },
  )
}
