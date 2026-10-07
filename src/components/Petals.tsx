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
    let dpr = 1
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
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      const count = Math.round(Math.min(60, (w * h) / 22000) * density)
      petals = Array.from({ length: count }, () => spawn(true))
    }

    const SPRITE = 64
    const sprites = COLORS.map((color) => {
      const c = document.createElement('canvas')
      c.width = c.height = SPRITE
      const sx = c.getContext('2d')!
      const r = SPRITE / 2
      sx.translate(r, r)
      const s = r * 0.9
      const g = sx.createLinearGradient(0, -s, 0, s)
      g.addColorStop(0, color)
      g.addColorStop(1, '#1a0207')
      sx.fillStyle = g
      sx.beginPath()
      sx.moveTo(0, s)
      sx.bezierCurveTo(s * 1.1, s * 0.4, s * 0.8, -s, 0, -s * 0.7)
      sx.bezierCurveTo(-s * 0.8, -s, -s * 1.1, s * 0.4, 0, s)
      sx.fill()
      return c
    })

    const drawPetal = (p: P) => {
      const sy = Math.abs(Math.cos(p.flip)) * 0.8 + 0.2
      const cos = Math.cos(p.rot)
      const sin = Math.sin(p.rot)
      ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin * sy, dpr * cos * sy, dpr * p.x, dpr * p.y)
      const d = p.s / 0.9
      ctx.drawImage(sprites[p.hue], -d, -d, d * 2, d * 2)
    }

    let last = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const k = Math.min((now - last) / 16.67, 3)
      last = now
      if (!visible) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of petals) {
        p.y += p.vy * k
        p.x += (p.vx + Math.sin(p.flip) * 0.4) * k
        p.rot += p.vr * k
        p.flip += p.vf * k
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
    else raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [density])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
