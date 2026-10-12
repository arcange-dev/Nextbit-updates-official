import { useEffect, useRef, useState, type ReactNode } from 'react'

export type View = 'home' | 'news' | 'article' | 'learn' | 'build' | 'projects' | 'africa' | 'profile' | 'admin' | 'notfound' | 'login' | 'register' | 'design' | 'errors' | 'bookmarks' | 'notifications' | 'tutorials' | 'directory'

export function LogoMark({ size = 32, color = '#ff6a00' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="1" y="1" width="38" height="38" rx="6" stroke={color} strokeWidth="2" />
      <path d="M10 30V10l10 12V10M20 22l10 8V10" stroke={color} strokeWidth="3" strokeLinecap="square" />
      <rect x="27" y="7" width="6" height="6" fill={color} />
    </svg>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <span className="font-display text-[19px] font-bold tracking-[0.14em]">
          NEXT<span className="text-orange">BIT</span>
        </span>
      )}
    </span>
  )
}

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in')
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ ['--d' as string]: `${delay}ms` }}>
      {children}
    </div>
  )
}

export function CountUp({ to, suffix = '', dur = 1400 }: { to: number; suffix?: string; dur?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [v, setV] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur)
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [to, dur])
  return (
    <span ref={ref}>
      {v.toLocaleString()}
      {suffix}
    </span>
  )
}

const P: Record<string, string> = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4',
  bookmark: 'M6 4h12v17l-6-4-6 4z',
  bell: 'M6 17V11a6 6 0 1112 0v6l2 2H4zM10 21h4',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l5 5 9-10',
  home: 'M4 11l8-7 8 7v9H4z',
  news: 'M4 5h13v14H4zM17 9h3v10H7M7 9h7M7 13h7',
  learn: 'M3 9l9-5 9 5-9 5zM7 12v5c3 2 7 2 10 0v-5',
  build: 'M14 6l4 4-9 9H5v-4zM12 8l4 4',
  share: 'M6 12v7h12v-7M12 3v12M8 7l4-4 4 4',
  link: 'M10 14a4 4 0 005 0l3-3a4 4 0 00-5-5l-1 1M14 10a4 4 0 00-5 0l-3 3a4 4 0 005 5l1-1',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  edit: 'M4 20h4L19 9l-4-4L4 16z',
  chart: 'M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM4 12h2M18 12h2M12 4v2M12 18v2',
  folder: 'M3 6h6l2 2h10v11H3z',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  cpu: 'M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4',
  spark: 'M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z',
}

export function Icon({ n, size = 20, className = '' }: { n: keyof typeof P | string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={P[n]} />
    </svg>
  )
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  className?: string
}) {
  const base =
    'group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-[14px] font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 '
  const v =
    variant === 'primary'
      ? 'bg-orange text-black hover:bg-orange-2 hover:shadow-[0_8px_40px_-6px_rgba(255,106,0,0.7)]'
      : 'border border-white/20 text-white hover:border-orange hover:text-orange'
  return (
    <button onClick={onClick} className={base + v + ' ' + className}>
      {children}
      <Icon n="arrow" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-orange">
      <span className="h-px w-8 bg-orange" />
      {children}
    </div>
  )
}

export function Verified({ source, updated = 'Oct 5, 2026' }: { source: string; updated?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-3 text-[12px] text-mute">
      <span className="flex items-center gap-1.5 font-medium text-white">
        <Icon n="shield" size={15} className="text-orange" /> Verified
      </span>
      <span>
        Source: <span className="text-white">{source}</span>
      </span>
      <span>Updated {updated}</span>
    </div>
  )
}

/* Reusable 3D chip built from stacked CSS layers */
export function Chip3D({ layers = 3, size = 220, spin = true }: { layers?: number; size?: number; spin?: boolean }) {
  const slabs = Array.from({ length: 8 })
  const pins = Array.from({ length: 12 })
  return (
    <div style={{ perspective: 1200, width: size, height: size }} className="relative">
      <div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d', animation: spin ? 'spinY 28s linear infinite' : undefined, transform: 'rotateX(62deg) rotateZ(30deg)' }}
      >
        {slabs.map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 border border-white/10"
            style={{ transform: `translateZ(${i * 3}px)`, background: i === 7 ? 'linear-gradient(135deg,#2a2a2e,#0e0e10)' : '#141416' }}
          />
        ))}
        {pins.map((_, i) => (
          <span key={'t' + i} className="absolute h-3 w-[3px] bg-zinc-400" style={{ left: `${10 + i * 7}%`, top: -10, transform: 'translateZ(10px)' }} />
        ))}
        {pins.map((_, i) => (
          <span key={'b' + i} className="absolute h-3 w-[3px] bg-zinc-400" style={{ left: `${10 + i * 7}%`, bottom: -10, transform: 'translateZ(10px)' }} />
        ))}
        {pins.map((_, i) => (
          <span key={'l' + i} className="absolute h-[3px] w-3 bg-zinc-400" style={{ top: `${10 + i * 7}%`, left: -10, transform: 'translateZ(10px)' }} />
        ))}
        {pins.map((_, i) => (
          <span key={'r' + i} className="absolute h-[3px] w-3 bg-zinc-400" style={{ top: `${10 + i * 7}%`, right: -10, transform: 'translateZ(10px)' }} />
        ))}
        <div
          className="absolute inset-[22%] border border-orange/60 bg-black"
          style={{ transform: 'translateZ(28px)', boxShadow: '0 0 60px rgba(255,106,0,0.55), inset 0 0 30px rgba(255,106,0,0.4)' }}
        >
          <div className="grid h-full w-full gap-[3px] p-1.5" style={{ gridTemplateColumns: `repeat(${layers + 2},1fr)` }}>
            {Array.from({ length: (layers + 2) ** 2 }).map((_, i) => (
              <span key={i} className="bg-orange" style={{ opacity: 0.25 + ((i * 37) % 70) / 100, animation: `pulse-o ${2 + (i % 5) * 0.4}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
        <div className="absolute inset-[40%] bg-orange-2/80 blur-[2px]" style={{ transform: 'translateZ(40px)' }} />
      </div>
    </div>
  )
}
