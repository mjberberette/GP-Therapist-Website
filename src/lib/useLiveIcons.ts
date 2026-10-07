import { useEffect } from 'react'

/** Runs icon CSS animations only while the icon is near the viewport. */
export function useLiveIcons() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)),
      { rootMargin: '100px 0px' },
    )
    const observed = new WeakSet<Element>()
    const scan = () =>
      document.querySelectorAll('.icon').forEach((el) => {
        if (observed.has(el)) return
        observed.add(el)
        io.observe(el)
      })
    scan()
    let queued = 0
    const mo = new MutationObserver(() => {
      if (!queued) queued = requestAnimationFrame(() => ((queued = 0), scan()))
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      cancelAnimationFrame(queued)
      mo.disconnect()
      io.disconnect()
    }
  }, [])
}
