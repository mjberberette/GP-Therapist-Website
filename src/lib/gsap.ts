import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP)

ScrollTrigger.config({ ignoreMobileResize: true })

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/**
 * Plays on first entry and never reverses. Use instead of `once: true`: a `once` trigger kills itself
 * when it fires during a refresh (e.g. reloading mid-page), which corrupts ScrollTrigger's trigger list.
 */
export const PLAY_ONCE = 'play none none none'

export { gsap, ScrollTrigger, SplitText, useGSAP }
