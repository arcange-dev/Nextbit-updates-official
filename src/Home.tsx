import { useEffect, useRef, useState } from 'react'
import { ARTICLES, ASK, BIT, IMG, PATHS, PROJECTS, TOPICS, type Article } from './data'
import { Btn, Chip3D, CountUp, Eyebrow, Icon, Reveal, type View } from './ui'

type Go = (v: View, id?: string) => void

export function Hero({ go }: { go: Go }) {
  const ref = useRef<HTMLElement>(null)
  const [m, setM] = useState({ x: 0.5, y: 0.4 })
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    setM({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height })
  }
  const px = (m.x - 0.5) * 2
  const py = (m.y - 0.5) * 2
  return (
    <section ref={ref} onMouseMove={onMove} className="grid-bg relative flex min-h-screen items-center overflow-hidden pt-20">
      <div className="pointer-events-none absolute inset-0 transition-[background] duration-300" style={{ background: `radial-gradient(520px circle at ${m.x * 100}% ${m.y * 100}%, rgba(255,106,0,0.16), transparent 60%)` }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#050505_85%)]" />
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="absolute h-[3px] w-[3px] bg-orange" style={{ left: `${(i * 53) % 100}%`, top: `${40 + ((i * 29) % 55)}%`, animation: `drift ${5 + (i % 5)}s ${i * 0.5}s linear infinite` }} />
      ))}
      <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-6 px-5 lg:grid-cols-[1.25fr_1fr] lg:px-10">
        <div>
          <div style={{ animation: 'pageIn .9s .1s var(--ease-cine) both' }}><Eyebrow>NextBit Updates · Live from Kigali</Eyebrow></div>
          <h1 className="mt-6 font-display text-[clamp(3.2rem,9.5vw,8.2rem)] font-bold uppercase leading-[0.88]">
            {['The future', 'is being', 'built now.'].map((l, i) => (
              <span key={l} className="block overflow-hidden">
                <span className={`block ${i === 2 ? 'text-orange' : ''}`} style={{ animation: `pageIn .9s ${0.2 + i * 0.12}s var(--ease-cine) both` }}>{l}</span>
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-mute" style={{ animation: 'pageIn .9s .7s var(--ease-cine) both' }}>
            Discover the technology shaping tomorrow, from AI and software engineering to electronics, robotics, cybersecurity and African innovation.
          </p>
          <div className="mt-9 flex flex-wrap gap-3" style={{ animation: 'pageIn .9s .85s var(--ease-cine) both' }}>
            <Btn onClick={() => go('news')}>Explore Latest News</Btn>
            <Btn variant="ghost" onClick={() => go('learn')}>Start Learning</Btn>
          </div>
        </div>
        <div className="relative hidden h-[560px] items-center justify-center lg:flex" style={{ transform: `translate(${px * -14}px, ${py * -10}px)`, transition: 'transform .4s var(--ease-cine)' }}>
          <div style={{ animation: 'bob 7s ease-in-out infinite' }}><Chip3D size={300} layers={4} /></div>
          <div className="absolute left-0 top-16 border border-line bg-card/80 p-3 font-mono text-[11px] leading-5 backdrop-blur" style={{ transform: `translate(${px * 22}px, ${py * 16}px)`, animation: 'bob 6s ease-in-out infinite' }}>
            <span className="text-orange">const</span> future = <span className="text-orange">await</span> build();
          </div>
          <div className="absolute bottom-20 right-0 border border-line bg-card/80 p-3 font-mono text-[11px] backdrop-blur" style={{ transform: `translate(${px * 30}px, ${py * 20}px)`, animation: 'bob 8s 1s ease-in-out infinite' }}>
            <div className="text-mute">NPU · INT8</div>
            <div className="mt-1 text-lg font-bold text-orange">412 TOPS</div>
          </div>
          <div className="absolute bottom-6 left-10 flex items-center gap-2 border border-orange/40 bg-black/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-orange backdrop-blur" style={{ transform: `translate(${px * 16}px, ${py * 12}px)` }}>
            <Icon n="cpu" size={14} /> ESP32-S3
          </div>
        </div>
        <div className="mx-auto -mt-4 mb-6 flex justify-center lg:hidden"><div style={{ animation: 'bob 7s ease-in-out infinite' }}><Chip3D size={170} layers={2} /></div></div>
      </div>
    </section>
  )
}

export function Ticker() {
  const items = ['AI', 'CYBERSECURITY', 'SOFTWARE', 'ELECTRONICS', 'ROBOTICS', 'AFRICA TECH', 'HARDWARE', 'SPACE']
  const row = [...items, ...items, ...items, ...items]
  return (
    <div className="flex items-center overflow-hidden border-y border-line bg-ink-2" aria-label="Live technology feed">
      <div className="z-10 flex shrink-0 items-center gap-2 bg-orange px-5 py-4 font-mono text-xs font-bold text-black">
        <span className="h-2 w-2 bg-black" style={{ animation: 'blink 1.2s infinite' }} /> LIVE
      </div>
      <div className="flex overflow-hidden">
        <div className="marquee flex shrink-0 whitespace-nowrap">
          {row.map((t, i) => (
            <span key={i} className="flex items-center gap-8 px-4 font-display text-lg font-semibold tracking-[0.18em] text-white/80">
              {t} <span className="text-orange">/</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ArticleMeta({ a }: { a: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-mute">
      <span>{a.author}</span>·<span>{a.date}</span>·<span className="flex items-center gap-1"><Icon n="clock" size={12} />{a.read}</span>
    </div>
  )
}

export function Breaking({ go, saved, toggle }: { go: Go; saved: Set<string>; toggle: (id: string) => void }) {
  const [f, ...rest] = ARTICLES
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-10">
      <Reveal>
        <div className="flex items-end justify-between">
          <div><Eyebrow>Breaking</Eyebrow><h2 className="mt-3 font-display text-4xl font-bold sm:text-6xl">LATEST SIGNAL</h2></div>
          <button onClick={() => go('news')} className="group hidden items-center gap-2 text-sm text-mute hover:text-orange sm:flex">All news <Icon n="arrow" size={16} className="transition group-hover:translate-x-1" /></button>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.45fr_1fr]">
        <Reveal>
          <article className="group relative cursor-pointer overflow-hidden" onClick={() => go('article', f.id)}>
            <div className="aspect-[4/3.2] overflow-hidden bg-card sm:aspect-[16/11]">
              <img src={f.img} alt="Close-up of a microchip on a circuit board" className="h-full w-full object-cover opacity-80 transition duration-[900ms] ease-[var(--ease-cine)] group-hover:scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
              <span className="bg-orange px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-black">{f.cat}</span>
              <h3 className="mt-4 max-w-2xl font-display text-2xl font-bold leading-[1.05] transition-transform duration-500 group-hover:-translate-y-1 sm:text-5xl">{f.title}</h3>
              <p className="mt-3 hidden max-w-xl text-mute sm:block">{f.summary}</p>
              <div className="mt-4 flex items-center justify-between"><ArticleMeta a={f} /><Icon n="arrow" size={24} className="text-orange transition-transform duration-300 group-hover:translate-x-2" /></div>
            </div>
            <div className="absolute inset-0 border border-transparent transition group-hover:border-orange/60" />
          </article>
        </Reveal>
        <div className="flex flex-col">
          {rest.slice(0, 4).map((a, i) => (
            <Reveal key={a.id} delay={i * 80}>
              <article onClick={() => go('article', a.id)} className="group flex cursor-pointer gap-4 border-b border-line py-5 first:pt-0">
                <div className="h-24 w-28 shrink-0 overflow-hidden bg-card sm:h-28 sm:w-36">
                  <img src={a.img} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-orange">{a.cat}</div>
                    <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug transition group-hover:text-orange-2">{a.title}</h3>
                  </div>
                  <div className="flex items-center justify-between"><ArticleMeta a={a} />
                    <button onClick={(e) => { e.stopPropagation(); toggle(a.id) }} aria-label="Bookmark" aria-pressed={saved.has(a.id)} className={saved.has(a.id) ? 'text-orange' : 'text-mute hover:text-white'}><Icon n="bookmark" size={16} /></button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Trending() {
  const [sel, setSel] = useState(0)
  return (
    <section className="bg-ink-2 py-24">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        <Reveal><Eyebrow>Trending</Eyebrow><h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-[0.95] sm:text-6xl">WHAT’S MOVING TECHNOLOGY FORWARD</h2></Reveal>
      </div>
      <div className="mt-12 flex gap-1 overflow-x-auto px-5 lg:px-10 lg:[&>*]:min-w-0">
        {TOPICS.map((t, i) => (
          <button key={t.t} onClick={() => setSel(i)} aria-pressed={sel === i} className={`group relative h-[420px] shrink-0 overflow-hidden text-left transition-all duration-700 ease-[var(--ease-cine)] ${sel === i ? 'w-[min(80vw,440px)]' : 'w-[110px] sm:w-[130px]'}`}>
            <img src={t.img} alt="" loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${sel === i ? 'scale-100 opacity-70' : 'scale-110 opacity-30 grayscale group-hover:opacity-50'}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className={`absolute inset-0 border transition ${sel === i ? 'border-orange' : 'border-line group-hover:border-white/30'}`} />
            <span className="absolute left-4 top-4 font-mono text-xs text-orange">{t.n}</span>
            <div className={`absolute bottom-5 left-4 origin-bottom-left transition-all duration-700 ${sel === i ? '' : 'sm:-rotate-90 sm:translate-x-3 sm:whitespace-nowrap'}`}>
              <div className={`font-display font-bold uppercase ${sel === i ? 'text-4xl' : 'text-lg'}`}>{t.t}</div>
              {sel === i && <div className="mt-1 text-sm text-mute">{t.d}</div>}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export function UnderstandBit() {
  const levels = ['Beginner', 'Developer', 'Engineer'] as const
  const [lv, setLv] = useState<(typeof levels)[number]>('Beginner')
  const c = BIT[lv]
  const idx = levels.indexOf(lv)
  return (
    <section className="relative overflow-hidden py-28">
      <div className="pointer-events-none absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 bg-orange/10 blur-[140px]" />
      <div className="relative mx-auto max-w-[1440px] px-5 lg:px-10">
        <Reveal>
          <Eyebrow>Signature</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.88]">UNDERSTAND<br /><span className="text-orange">THE BIT</span></h2>
          <p className="mt-6 max-w-xl text-lg text-mute">Technology news is easier when you understand what is happening underneath.</p>
        </Reveal>
        <div className="mt-14 grid items-stretch gap-0 border border-line lg:grid-cols-[1.2fr_1fr]">
          <div className="p-6 sm:p-10">
            <div className="font-mono text-[11px] uppercase tracking-widest text-mute">Topic</div>
            <h3 className="mt-2 font-display text-3xl font-bold sm:text-4xl">WHAT IS AN AI ACCELERATOR?</h3>
            <div role="tablist" aria-label="Explanation level" className="relative mt-8 grid grid-cols-3 border border-line bg-card p-1">
              <span className="absolute inset-y-1 w-[calc(33.333%-2.67px)] bg-orange transition-transform duration-500 ease-[var(--ease-cine)]" style={{ transform: `translateX(calc(${idx * 100}% + ${idx * 0}px))` }} />
              {levels.map((l) => (
                <button key={l} role="tab" aria-selected={lv === l} onClick={() => setLv(l)} className={`relative z-10 py-3 text-xs font-bold uppercase tracking-wider transition-colors sm:text-sm ${lv === l ? 'text-black' : 'text-mute hover:text-white'}`}>{l}</button>
              ))}
            </div>
            <div key={lv} className="page-in mt-8 min-h-[240px]">
              <h4 className="font-display text-2xl font-semibold text-orange-2">{c.h}</h4>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-zinc-300">{c.p}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {c.tags.map((t) => <span key={t} className="border border-orange/40 px-3 py-1 font-mono text-xs text-orange">{t}</span>)}
              </div>
            </div>
          </div>
          <div className="relative grid min-h-[360px] place-items-center border-t border-line bg-ink-2 lg:border-l lg:border-t-0">
            <div className="grid-bg absolute inset-0 opacity-70" />
            <div className="relative" style={{ animation: 'bob 6s ease-in-out infinite' }}><Chip3D size={230} layers={c.layers + 1} /></div>
            <div className="absolute bottom-4 left-4 font-mono text-[11px] text-mute">Detail level <span className="text-orange">{idx + 1}/3</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function AskAI() {
  const qs = Object.keys(ASK)
  const [q, setQ] = useState('')
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)
  const ask = (text: string) => {
    const key = qs.find((k) => k.toLowerCase() === text.toLowerCase().trim())
    const ans = key ? ASK[key] : `Good question. NextBit AI is in preview and has curated answers for the examples above. “${text}” has been queued for our editors.`
    setQ(text)
    setOut('')
    setBusy(true)
    let i = 0
    const t = setInterval(() => {
      i += 3
      setOut(ans.slice(0, i))
      if (i >= ans.length) {
        clearInterval(t)
        setBusy(false)
      }
    }, 22)
  }
  return (
    <section className="bg-ink-2 py-24">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 lg:grid-cols-[1fr_1.1fr] lg:px-10">
        <Reveal>
          <Eyebrow>Ask NextBit AI</Eyebrow>
          <h2 className="mt-3 font-display text-5xl font-bold leading-[0.92] sm:text-7xl">ASK ANYTHING ABOUT <span className="text-orange">TECHNOLOGY.</span></h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {qs.map((k) => <button key={k} onClick={() => ask(k)} className="border border-line px-4 py-2 text-sm text-mute transition hover:border-orange hover:text-orange">{k}</button>)}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="relative overflow-hidden border border-line bg-card">
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" aria-hidden>
              {[[40, 50], [160, 120], [300, 60], [420, 160], [90, 230], [260, 260], [400, 300]].map(([x, y], i, a) => (
                <g key={i}>
                  {a[i + 1] && <line x1={x} y1={y} x2={a[i + 1][0]} y2={a[i + 1][1]} stroke="#ff6a00" strokeWidth="1" strokeDasharray="4 6" style={{ animation: 'dash 2s linear infinite' }} />}
                  <circle cx={x} cy={y} r="3.5" fill="#ff6a00" style={{ animation: `pulse-o ${2 + i * 0.3}s infinite` }} />
                </g>
              ))}
            </svg>
            <div className="relative p-6 sm:p-8">
              <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) ask(q) }} className="flex items-center gap-3 border-b border-white/20 pb-3 focus-within:border-orange">
                <Icon n="spark" className="text-orange" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything about technology." aria-label="Ask NextBit AI" className="w-full bg-transparent text-lg outline-none placeholder:text-zinc-600" />
                <button aria-label="Send" className="text-orange"><Icon n="arrow" /></button>
              </form>
              <div className="mt-6 min-h-[200px] font-mono text-[13px] leading-7 text-zinc-300 sm:text-sm">
                {out ? <>{out}{busy && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-orange" style={{ animation: 'blink 0.8s infinite' }} />}</> : <span className="text-zinc-600">// awaiting query_</span>}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function Software() {
  const topics = ['Programming', 'Web', 'Mobile', 'Backend', 'APIs', 'Databases', 'DevOps', 'Cloud', 'Git / GitHub', 'Architecture']
  const lines = ['import { future } from "@nextbit/core";', '', 'async function build() {', '  const idea = await learn("everything");', '  const code = ship(idea);', '  return code.deploy({ region: "kigali-1" });', '}', '', 'const future = await build();']
  const [n, setN] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setN((x) => (x > 140 ? 0 : x + 1)), 45)
    return () => clearInterval(t)
  }, [])
  const text = lines.join('\n').slice(0, n * 2)
  return (
    <section className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-28 lg:grid-cols-2 lg:px-10">
      <Reveal>
        <Eyebrow>Software Engineering</Eyebrow>
        <h2 className="mt-3 font-display text-5xl font-bold leading-[0.92] sm:text-7xl">BUILD BETTER <span className="text-orange">SOFTWARE</span></h2>
        <ul className="mt-10 grid grid-cols-2 border-t border-line">
          {topics.map((t, i) => (
            <li key={t} className="group flex cursor-default items-center gap-3 border-b border-line py-3.5 text-[15px] text-zinc-300 transition hover:pl-2 hover:text-orange">
              <span className="font-mono text-[11px] text-orange">{String(i + 1).padStart(2, '0')}</span>{t}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={120}>
        <div className="border border-line bg-card shadow-[0_30px_80px_-30px_rgba(255,106,0,0.3)]">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="h-2.5 w-2.5 bg-orange" /><span className="h-2.5 w-2.5 bg-zinc-700" /><span className="h-2.5 w-2.5 bg-zinc-700" />
            <span className="ml-3 font-mono text-xs text-mute">future.ts</span>
          </div>
          <pre className="min-h-[280px] overflow-x-auto p-5 font-mono text-[13px] leading-7 text-zinc-300 sm:p-7 sm:text-sm">
            {text}<span className="bg-orange text-orange" style={{ animation: 'blink 1s infinite' }}>_</span>
          </pre>
        </div>
      </Reveal>
    </section>
  )
}

export function Electronics() {
  const items = ['Arduino', 'ESP32', 'Raspberry Pi', 'Sensors', 'Microcontrollers', 'IoT', 'Embedded']
  const [a, setA] = useState(1)
  return (
    <section className="relative overflow-hidden bg-ink-2 py-28">
      <img src={IMG.pcb} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-[0.14]" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-2 via-ink-2/80 to-ink-2" />
      <div className="relative mx-auto max-w-[1440px] px-5 lg:px-10">
        <Reveal>
          <Eyebrow>Electronics</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.88]">FROM CODE<br />TO <span className="text-orange">CIRCUITS</span></h2>
        </Reveal>
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-wrap content-start gap-2">
            {items.map((t, i) => <button key={t} onClick={() => setA(i)} aria-pressed={a === i} className={`border px-5 py-3 font-display text-lg font-semibold transition ${a === i ? 'border-orange bg-orange text-black' : 'border-line text-white hover:border-orange'}`}>{t}</button>)}
          </div>
          <div className="relative border border-line bg-black/50 p-6 backdrop-blur sm:p-10">
            <svg viewBox="0 0 520 220" className="w-full" role="img" aria-label="Code flowing to a microcontroller and onto an LED">
              <rect x="10" y="70" width="130" height="80" fill="#111113" stroke="#333" />
              <text x="75" y="105" textAnchor="middle" fill="#a1a1aa" fontFamily="JetBrains Mono" fontSize="11">digitalWrite(</text>
              <text x="75" y="125" textAnchor="middle" fill="#ff6a00" fontFamily="JetBrains Mono" fontSize="11">LED, HIGH);</text>
              <path d="M140 110H210M310 110H400" stroke="#ff6a00" strokeWidth="2" strokeDasharray="6 6" style={{ animation: 'dash 1s linear infinite' }} />
              <rect x="210" y="60" width="100" height="100" fill="#17171a" stroke="#ff6a00" />
              {Array.from({ length: 6 }).map((_, i) => <g key={i}><rect x={218 + i * 15} y="50" width="5" height="10" fill="#888" /><rect x={218 + i * 15} y="160" width="5" height="10" fill="#888" /></g>)}
              <text x="260" y="116" textAnchor="middle" fill="#fff" fontFamily="Space Grotesk" fontWeight="700" fontSize="15">{items[a].slice(0, 9).toUpperCase()}</text>
              <circle cx="440" cy="110" r="26" fill="#ff6a00" style={{ animation: 'pulse-o 1.4s infinite', filter: 'drop-shadow(0 0 18px #ff6a00)' }} />
              <text x="440" y="165" textAnchor="middle" fill="#a1a1aa" fontFamily="JetBrains Mono" fontSize="10">LED ON</text>
            </svg>
            <p className="mt-4 text-sm text-mute">Software becomes voltage. Pick a platform to see the path from a line of code to a glowing LED.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ProjectCard({ p }: { p: (typeof PROJECTS)[number] }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-line bg-card transition duration-500 hover:-translate-y-1 hover:border-orange/60">
      <div className="h-44 overflow-hidden bg-card-2"><img src={p.img} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110" /></div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest"><span className="text-orange">{p.tech}</span><span className="text-mute">{p.diff}</span></div>
        <h3 className="mt-3 font-display text-xl font-semibold">{p.t}</h3>
        <p className="mt-2 text-[13px] text-mute">Parts: {p.parts}</p>
        <div className="mt-auto pt-5">
          <div className="mb-2 flex justify-between text-[11px] text-mute"><span>{p.time} · by {p.by}</span><span className="text-orange">{p.diff}</span></div>
          <div className="h-1 bg-white/10" role="progressbar" aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Difficulty"><div className="h-full bg-orange transition-all duration-700 group-hover:bg-orange-2" style={{ width: `${p.pct}%` }} /></div>
        </div>
      </div>
    </article>
  )
}

export function Projects({ go }: { go: Go }) {
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-28 lg:px-10">
      <Reveal>
        <div className="flex items-end justify-between"><div><Eyebrow>Projects</Eyebrow><h2 className="mt-3 font-display text-5xl font-bold sm:text-7xl">BUILD <span className="text-orange">SOMETHING</span></h2></div>
          <button onClick={() => go('projects')} className="group hidden items-center gap-2 text-sm text-mute hover:text-orange sm:flex">All projects <Icon n="arrow" size={16} className="transition group-hover:translate-x-1" /></button></div>
      </Reveal>
      <div className="mt-12 flex snap-x gap-4 overflow-x-auto pb-4">
        {PROJECTS.map((p, i) => <div key={p.t} className="w-[300px] shrink-0 snap-start"><Reveal delay={i * 60} className="h-full"><ProjectCard p={p} /></Reveal></div>)}
      </div>
    </section>
  )
}

export function LearnPaths({ compact = false }: { compact?: boolean }) {
  const [sel, setSel] = useState<Record<string, number>>({ 'Software Engineering': 1, AI: 1, Electronics: 2, Cybersecurity: 0, 'Web Development': 3 })
  return (
    <section className={compact ? '' : 'bg-ink-2 py-28'}>
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        {!compact && <Reveal><Eyebrow>Learn</Eyebrow><h2 className="mt-3 font-display text-5xl font-bold sm:text-7xl">LEARN THE <span className="text-orange">TECHNOLOGY</span></h2></Reveal>}
        <div className="mt-12 divide-y divide-line border-y border-line">
          {PATHS.map((p) => (
            <Reveal key={p.t}>
              <div className="grid gap-6 py-8 lg:grid-cols-[240px_1fr] lg:items-center">
                <h3 className="font-display text-2xl font-bold uppercase">{p.t}</h3>
                <div className="flex gap-0 overflow-x-auto pb-2">
                  {p.steps.map((s, i) => {
                    const done = i < sel[p.t]
                    const cur = i === sel[p.t]
                    return (
                      <button key={s} onClick={() => setSel({ ...sel, [p.t]: i })} className="group flex min-w-[130px] flex-1 flex-col items-start" aria-label={`${p.t}: ${s}${done ? ' (completed)' : cur ? ' (current)' : ''}`}>
                        <div className="flex w-full items-center">
                          <span className={`grid h-9 w-9 shrink-0 place-items-center border text-xs font-bold transition ${done ? 'border-orange bg-orange text-black' : cur ? 'border-orange text-orange shadow-[0_0_24px_rgba(255,106,0,0.5)]' : 'border-white/20 text-mute group-hover:border-white/50'}`}>{done ? <Icon n="check" size={16} /> : i + 1}</span>
                          {i < p.steps.length - 1 && (
                            <svg className="h-1 flex-1" preserveAspectRatio="none" viewBox="0 0 100 2"><line x1="0" y1="1" x2="100" y2="1" stroke={done ? '#ff6a00' : '#333'} strokeWidth="2" strokeDasharray="5 5" style={done ? { animation: 'dash 1.2s linear infinite' } : undefined} /></svg>
                          )}
                        </div>
                        <span className={`mt-3 pr-3 text-left text-sm ${cur ? 'font-semibold text-white' : 'text-mute'}`}>{s}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const CITIES = [
  { n: 'Kigali', c: 'Rwanda', x: 66, y: 55, hot: true },
  { n: 'Nairobi', c: 'Kenya', x: 73, y: 57 },
  { n: 'Lagos', c: 'Nigeria', x: 35, y: 48 },
  { n: 'Cape Town', c: 'South Africa', x: 52, y: 89 },
  { n: 'Accra', c: 'Ghana', x: 27, y: 50 },
  { n: 'Kampala', c: 'Uganda', x: 68, y: 51 },
  { n: 'Dar es Salaam', c: 'Tanzania', x: 76, y: 64 },
]

export function AfricaMap() {
  const [h, setH] = useState(0)
  const pts: string[] = []
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Stylized dot map of Africa with Rwanda highlighted">
        <defs>
          <pattern id="dots" width="2.4" height="2.4" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r="0.55" fill="#52525b" /></pattern>
          <clipPath id="af"><path d="M30 12L42 8L55 10L62 14L75 16L82 22L88 30L95 36L90 44L84 52L80 62L72 72L66 84L58 92L50 90L46 78L44 66L40 58L32 54L22 52L14 46L8 38L10 28L20 20Z" /></clipPath>
        </defs>
        <rect width="100" height="100" fill="url(#dots)" clipPath="url(#af)" />
        <path d="M30 12L42 8L55 10L62 14L75 16L82 22L88 30L95 36L90 44L84 52L80 62L72 72L66 84L58 92L50 90L46 78L44 66L40 58L32 54L22 52L14 46L8 38L10 28L20 20Z" fill="none" stroke="#ff6a00" strokeOpacity="0.35" strokeWidth="0.3" />
        {CITIES.filter((c) => c.n !== 'Kigali').map((c) => <line key={c.n} x1={66} y1={55} x2={c.x} y2={c.y} stroke="#ff6a00" strokeOpacity={0.35} strokeWidth="0.25" strokeDasharray="1 1.4" style={{ animation: 'dash 3s linear infinite' }} />)}
        {CITIES.map((c, i) => (
          <g key={c.n} onMouseEnter={() => setH(i)} style={{ cursor: 'pointer' }} tabIndex={0} onFocus={() => setH(i)} role="button" aria-label={`${c.n}, ${c.c}`}>
            {(c.hot || h === i) && <circle cx={c.x} cy={c.y} r="4.5" fill="#ff6a00" opacity="0.25" style={{ animation: 'pulse-o 1.8s infinite' }} />}
            <circle cx={c.x} cy={c.y} r={c.hot ? 2 : 1.2} fill={c.hot || h === i ? '#ff6a00' : '#fff'} />
          </g>
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 border border-line bg-card/90 px-4 py-2 backdrop-blur">
        <div className="font-mono text-[10px] uppercase tracking-widest text-orange">{CITIES[h].c}</div>
        <div className="font-display text-lg font-semibold">{CITIES[h].n}</div>
      </div>
      {pts.length > 0 && null}
    </div>
  )
}

export function AfricaSection({ go }: { go: Go }) {
  const stats: [number, string, string][] = [[1200, '+', 'Active startups tracked'], [54, '', 'Countries covered'], [38, 'K', 'Developers in our community'], [96, '', 'University labs']]
  return (
    <section className="relative overflow-hidden py-28">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 lg:grid-cols-[1fr_1fr] lg:px-10">
        <Reveal>
          <Eyebrow>Africa Tech</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(3rem,8vw,6.5rem)] font-bold uppercase leading-[0.88]">Africa is building the <span className="text-orange">future.</span></h2>
          <p className="mt-6 max-w-lg text-lg text-mute">From Kigali to Lagos to Cape Town: startups, universities, researchers and student builders shaping what comes next.</p>
          <div className="mt-8 flex flex-wrap gap-2 text-sm text-zinc-300">
            {['Rwanda', 'Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Uganda', 'Tanzania'].map((c) => <span key={c} className={`border px-3 py-1.5 ${c === 'Rwanda' ? 'border-orange text-orange' : 'border-line'}`}>{c}</span>)}
          </div>
          <div className="mt-10"><Btn onClick={() => go('africa')}>Explore Africa Tech</Btn></div>
        </Reveal>
        <Reveal delay={150}><AfricaMap /></Reveal>
      </div>
      <div className="mx-auto mt-20 grid max-w-[1440px] grid-cols-2 gap-px px-5 lg:grid-cols-4 lg:px-10">
        {stats.map(([n, s, l]) => (
          <div key={l} className="border-t border-line py-6 pr-4">
            <div className="font-display text-5xl font-bold text-orange sm:text-6xl"><CountUp to={n} suffix={s} /></div>
            <div className="mt-2 text-sm text-mute">{l}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Rwanda() {
  const t = ['Startups', 'Innovation', 'ICT', 'FinTech', 'AI', 'Education', 'Robotics', 'Electronics', 'Developer communities', 'Events']
  return (
    <section className="relative">
      <div className="relative h-[560px] overflow-hidden sm:h-[640px]">
        <img src={IMG.kigali2} alt="Aerial view of Kigali" className="absolute inset-0 h-full w-full object-cover grayscale-[40%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink" />
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-center px-5 lg:px-10">
          <Reveal>
            <Eyebrow>Rwanda Tech</Eyebrow>
            <h2 className="mt-3 font-display text-[clamp(4rem,13vw,11rem)] font-bold uppercase leading-[0.82]">Rwanda<br /><span className="text-orange">Tech</span></h2>
            <div className="mt-8 flex max-w-2xl flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-300">
              {t.map((x) => <span key={x} className="flex items-center gap-2"><span className="h-1 w-1 bg-orange" />{x}</span>)}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
