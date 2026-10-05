import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = (size: number, props: IconProps) => ({
  width: size,
  height: size,
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export function MoonIcon({ size = 48, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} className={`icon ${p.className ?? ''}`}>
      <path className="draw" d="M30 6a18 18 0 1 0 12 30A15 15 0 0 1 30 6Z" />
      <path className="draw" d="M14 14l1.2 2.6L18 18l-2.8 1.4L14 22l-1.2-2.6L10 18l2.8-1.4Z" />
      <circle className="draw" cx="22" cy="30" r="1.6" />
    </svg>
  )
}

export function RoseIcon({ size = 48, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} className={`icon ${p.className ?? ''}`}>
      <path className="draw" d="M13 16c0 7 5 11 11 11s11-4 11-11c-3 2-6 2-8 0-1 2-5 2-6 0-2 2-5 2-8 0Z" />
      <path className="draw" d="M18.5 16c-2-3.5 0-8 5.5-8s7.5 4.5 5.5 8" />
      <path className="draw" d="M24 11.5c-3 0-4.5 2.2-3.6 4.3.8 1.8 3.4 2.2 4.8.8 1.2-1.2.4-3.2-1.2-2.9" />
      <path className="draw" d="M24 27v17M24 37c-4.5-.6-7.6-3.6-8.6-7.4 4.4.2 7.6 2.6 8.6 7.4ZM24 33.5c3.4-.8 6-3 7-6.2-3.8 0-6.2 2.2-7 6.2ZM24 41l2.4-1.6M24 30.5l-2.2-1.2" />
    </svg>
  )
}

export function CandleIcon({ size = 48, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} className={`icon ${p.className ?? ''}`}>
      <path className="draw flame" d="M24 5c3 4 5 6.5 5 9.5a5 5 0 0 1-10 0C19 11.5 21 9 24 5Z" />
      <path className="draw" d="M24 14.5v4" />
      <path className="draw" d="M18 19h12v20H18z" />
      <path className="draw" d="M22 19v5c0 2 2 2 2 4" />
      <path className="draw" d="M12 39h24M14 43h20" />
    </svg>
  )
}

export function KeyIcon({ size = 48, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} className={`icon ${p.className ?? ''}`}>
      <circle className="draw" cx="24" cy="12" r="7" />
      <circle className="draw" cx="24" cy="12" r="2.5" />
      <path className="draw" d="M24 19v24M24 34h6M24 39h4M24 29h5" />
      <path className="draw" d="M17 12h-4M35 12h-4" />
    </svg>
  )
}

export function EyeIcon({ size = 48, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} className={`icon ${p.className ?? ''}`}>
      <path className="draw" d="M4 24c5-8 12-12 20-12s15 4 20 12c-5 8-12 12-20 12S9 32 4 24Z" />
      <circle className="draw pupil" cx="24" cy="24" r="6" />
      <circle className="pupil" cx="24" cy="24" r="2" fill="currentColor" />
      <path className="draw" d="M24 6v3M12 9l2 2.5M36 9l-2 2.5M24 42v-3" />
    </svg>
  )
}

export function TelehealthIcon({ size = 48, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} className={`icon ${p.className ?? ''}`}>
      <path className="draw" d="M9 12h30v20H9z" />
      <path className="draw" d="M4 36h40l-3 4H7z" />
      <path className="draw" d="M27 17a6 6 0 1 0 4 8 5 5 0 0 1-4-8Z" />
    </svg>
  )
}

export function PaymentsIcon({ size = 48, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} className={`icon ${p.className ?? ''}`}>
      <rect className="draw" x="5" y="12" width="38" height="24" rx="3" />
      <path className="draw" d="M5 19h38M11 29h8M33 27l1 2 2 .5-2 .5-1 2-1-2-2-.5 2-.5Z" />
    </svg>
  )
}

export function InsuranceIcon({ size = 48, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} className={`icon ${p.className ?? ''}`}>
      <path className="draw" d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10Z" />
      <path className="draw" d="M24 14l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L24 26.4l-5 2.8 1.2-5.6-4.2-3.8 5.6-.6Z" />
    </svg>
  )
}

export function DoorIcon({ size = 48, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} className={`icon ${p.className ?? ''}`}>
      <path className="draw" d="M12 44V20a12 12 0 0 1 24 0v24" />
      <path className="draw" d="M8 44h32" />
      <path className="draw" d="M18 44V22a6 6 0 0 1 12 0v22" />
      <circle className="draw" cx="27" cy="33" r="1" />
      <path className="draw" d="M24 4v4M21 6h6" />
    </svg>
  )
}

export function HeartIcon({ size = 48, ...p }: IconProps) {
  return (
    <svg {...base(size, p)} className={`icon ${p.className ?? ''}`}>
      <path className="draw" d="M24 41S7 30 7 18a8.5 8.5 0 0 1 17-2 8.5 8.5 0 0 1 17 2c0 12-17 23-17 23Z" />
      <path className="draw" d="M24 6v8M20 10h8" />
    </svg>
  )
}

export function SparkleIcon({ size = 16, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0Z" fill="currentColor" />
    </svg>
  )
}

export function ArrowIcon({ size = 18, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" {...p}>
      <path d="M5 19L19 5M8 5h11v11" />
    </svg>
  )
}

export function PhoneIcon({ size = 18, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" />
    </svg>
  )
}

export function PortalIcon({ size = 18, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M6 21V10a6 6 0 0 1 12 0v11Z" />
      <circle cx="12" cy="13" r="1.6" />
      <path d="M12 14.6V17" />
    </svg>
  )
}

export function CobwebCorner({ className = '' }: { className?: string }) {
  return (
    <svg className={`cobweb ${className}`} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.7" aria-hidden="true">
      <path className="draw" d="M0 0L120 120M0 0L120 60M0 0L60 120M0 0L120 15M0 0L15 120" />
      <path className="draw" d="M28 7Q24 18 26 26Q18 24 7 28" />
      <path className="draw" d="M56 14Q48 36 52 52Q36 48 14 56" />
      <path className="draw" d="M86 22Q72 54 78 78Q54 72 22 86" />
      <path className="draw" d="M114 30Q96 72 104 104Q72 96 30 114" />
    </svg>
  )
}

export function MoonPhases({ className = '' }: { className?: string }) {
  const crescent = 'M12 2a10 10 0 0 1 0 20a6 10 0 0 0 0-20Z'
  const half = 'M12 2a10 10 0 0 1 0 20Z'
  const gibbous = 'M12 2a10 10 0 0 1 0 20a6 10 0 0 1 0-20Z'
  const full = 'M12 2a10 10 0 0 1 0 20a10 10 0 0 1 0-20Z'
  const phases: [string, boolean][] = [
    ['', false],
    [crescent, false],
    [half, false],
    [gibbous, false],
    [full, false],
    [gibbous, true],
    [half, true],
    [crescent, true],
  ]
  return (
    <div className={`moon-phases ${className}`} aria-hidden="true">
      {phases.map(([d, mirror], i) => (
        <svg key={i} viewBox="0 0 24 24" width="14" height="14">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
          {d && <path d={d} fill="currentColor" transform={mirror ? 'translate(24 0) scale(-1 1)' : undefined} />}
        </svg>
      ))}
    </div>
  )
}

export const iconMap = {
  rose: RoseIcon,
  moon: MoonIcon,
  candle: CandleIcon,
  key: KeyIcon,
  eye: EyeIcon,
  telehealth: TelehealthIcon,
  payments: PaymentsIcon,
  insurance: InsuranceIcon,
  door: DoorIcon,
  heart: HeartIcon,
}

export type IconName = keyof typeof iconMap
