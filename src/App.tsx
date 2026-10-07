import { useCallback, useEffect, useState } from 'react'
import { ArchClipDefs } from './components/Arch'
import { SmoothScroll, useLenis } from './lib/smooth'
import { ScrollTrigger } from './lib/gsap'
import { useLiveIcons } from './lib/useLiveIcons'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import MobileDock from './components/MobileDock'
import HeroStory from './sections/HeroStory'
import Marquee from './sections/Marquee'
import Badges from './sections/Badges'
import About from './sections/About'
import Art from './sections/Art'
import Services from './sections/Services'
import Approaches from './sections/Approaches'
import Fees from './sections/Fees'
import Insurance from './sections/Insurance'
import Credentials from './sections/Credentials'
import Location from './sections/Location'
import Contact from './sections/Contact'
import Footer from './sections/Footer'

function Site() {
  const [ready, setReady] = useState(false)
  const lenis = useLenis()
  const onLoaded = useCallback(() => setReady(true), [])
  useLiveIcons()

  useEffect(() => {
    document.body.classList.toggle('is-loading', !ready)
    if (!ready) {
      window.scrollTo(0, 0)
      lenis?.stop()
    } else {
      lenis?.start()
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
  }, [ready, lenis])

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ArchClipDefs />
      <Preloader onComplete={onLoaded} />
      <Cursor />
      <Nav ready={ready} />
      <main id="main">
        <HeroStory ready={ready} />
        <Marquee />
        <Badges />
        <About />
        <Art />
        <Services />
        <Approaches />
        <Fees />
        <Insurance />
        <Credentials />
        <Location />
        <Contact />
      </main>
      <Footer />
      <MobileDock />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  )
}

export default function App() {
  return (
    <SmoothScroll>
      <Site />
    </SmoothScroll>
  )
}
