import type { ReactNode } from 'react'
import './Arch.css'

export const ARCH_PATH = 'M0,125 L0,52 Q0,14 50,0 Q100,14 100,52 L100,125'

export function ArchClipDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <clipPath id="arch-clip" clipPathUnits="objectBoundingBox">
          <path d="M0,1 L0,0.416 Q0,0.112 0.5,0 Q1,0.112 1,0.416 L1,1 Z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default function Arch({
  src,
  alt,
  className = '',
  children,
  eager = false,
}: {
  src: string
  alt: string
  className?: string
  children?: ReactNode
  eager?: boolean
}) {
  return (
    <figure className={`arch ${className}`}>
      <svg className="arch-frame arch-frame-outer" viewBox="-8 -10 116 143" aria-hidden="true">
        <path className="draw" d="M-8,133 L-8,50 Q-8,6 50,-10 Q108,6 108,50 L108,133" />
      </svg>
      <div className="arch-media">
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        <div className="arch-tint" aria-hidden="true" />
      </div>
      <svg className="arch-frame" viewBox="0 0 100 125" aria-hidden="true">
        <path className="draw" d={ARCH_PATH} />
      </svg>
      {children}
    </figure>
  )
}
