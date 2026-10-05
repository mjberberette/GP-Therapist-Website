import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/gsap'

type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; t: number; hue: 0 | 1 }

export default function Embers({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = prefersReducedMotion()
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    const mouse = { x: -9999, y: -9999 }
    let particles: P[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(110, (w * h) / 11000))
      particles = Array.from({ length: count }, () => spawn(true))
    }

    const spawn = (anywhere = false): P => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(Math.random() * 0.35 + 0.08),
      a: Math.random() * 0.6 + 0.2,
      t: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.55 ? 1 : 0,
    })

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.t += 0.02
        p.x += p.vx + Math.sin(p.t) * 0.12
        p.y += p.vy
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 14000) {
          const f = (1 - d2 / 14000) * 1.4
          p.x += (dx / Math.sqrt(d2 + 0.1)) * f
          p.y += (dy / Math.sqrt(d2 + 0.1)) * f
        }
        if (p.y < -10 || p.x < -10 || p.x > w + 10) Object.assign(p, spawn())
        const flicker = p.a * (0.65 + Math.sin(p.t * 3) * 0.35)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.hue ? `rgba(229, 87, 111, ${flicker})` : `rgba(236, 227, 214, ${flicker * 0.7})`
        ctx.shadowBlur = p.hue ? 8 : 0
        ctx.shadowColor = 'rgba(229, 87, 111, 0.8)'
        ctx.fill()
      }
    }

    const loop = () => {
      if (visible) draw()
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    io.observe(canvas)
    resize()
    if (reduce) draw()
    else loop()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
