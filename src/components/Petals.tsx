import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/gsap'

type P = { x: number; y: number; s: number; vy: number; vx: number; rot: number; vr: number; flip: number; vf: number; hue: number }

const COLORS = ['#7d0c22', '#a3142f', '#5a0818', '#c22d47']

export default function Petals({ className = '', density = 1 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let w = 0
    let h = 0
    let raf = 0
    let visible = false
    let petals: P[] = []

    const spawn = (anywhere = false): P => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -20,
      s: 6 + Math.random() * 10,
      vy: 0.4 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.6,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.03,
      flip: Math.random() * Math.PI * 2,
      vf: 0.02 + Math.random() * 0.03,
      hue: Math.floor(Math.random() * COLORS.length),
    })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(60, (w * h) / 22000) * density)
      petals = Array.from({ length: count }, () => spawn(true))
    }

    const drawPetal = (p: P) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(1, Math.abs(Math.cos(p.flip)) * 0.8 + 0.2)
      const g = ctx.createLinearGradient(0, -p.s, 0, p.s)
      g.addColorStop(0, COLORS[p.hue])
      g.addColorStop(1, '#1a0207')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, p.s)
      ctx.bezierCurveTo(p.s * 1.1, p.s * 0.4, p.s * 0.8, -p.s, 0, -p.s * 0.7)
      ctx.bezierCurveTo(-p.s * 0.8, -p.s, -p.s * 1.1, p.s * 0.4, 0, p.s)
      ctx.fill()
      ctx.restore()
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      ctx.clearRect(0, 0, w, h)
      for (const p of petals) {
        p.y += p.vy
        p.x += p.vx + Math.sin(p.flip) * 0.4
        p.rot += p.vr
        p.flip += p.vf
        if (p.y > h + 20) Object.assign(p, spawn())
        drawPetal(p)
      }
    }

    resize()
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    if (prefersReducedMotion()) petals.forEach(drawPetal)
    else tick()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [density])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
