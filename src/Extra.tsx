import { useEffect, useState, type ReactNode } from 'react'
import { api } from './api'
import { ARTICLES, PROJECTS, PATHS } from './data'
import { Btn, Chip3D, CountUp, Eyebrow, Icon, Logo, LogoMark, Reveal, type View } from './ui'

type Go = (v: View, id?: string) => void

export const TUTS = [
  { t: 'Git and GitHub in a weekend', lvl: 'Beginner', len: '6 lessons', cat: 'Software' },
  { t: 'Wiring your first ESP32 sensor', lvl: 'Beginner', len: '4 lessons', cat: 'Electronics' },
  { t: 'Intro to Linux for security', lvl: 'Intermediate', len: '8 lessons', cat: 'Cybersecurity' },
  { t: 'Build a REST API with Node', lvl: 'Intermediate', len: '7 lessons', cat: 'Backend' },
  { t: 'Run a small model on a Raspberry Pi', lvl: 'Advanced', len: '5 lessons', cat: 'AI' },
  { t: 'Reading a datasheet like an engineer', lvl: 'Advanced', len: '3 lessons', cat: 'Hardware' },
]
export const AUTHORS = ['Amina Uwase', 'Eric Habimana', 'Diane Mukamana', 'Kevin Otieno', 'Grace Wanjiru']

function Head({ eye, title, sub }: { eye: string; title: ReactNode; sub?: string }) {
  return (
    <div className="grid-bg border-b border-line pb-14 pt-36">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        <Eyebrow>{eye}</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(3rem,9vw,7.5rem)] font-bold uppercase leading-[0.88]">{title}</h1>
        {sub && <p className="mt-6 max-w-xl text-lg text-mute">{sub}</p>}
      </div>
    </div>
  )
}

export function EmptyState({ title, text, cta, onClick }: { title: string; text: string; cta?: string; onClick?: () => void }) {
  return (
    <div className="grid place-items-center border border-dashed border-line px-6 py-16 text-center">
      <div className="opacity-60"><Chip3D size={90} spin={false} layers={1} /></div>
      <h3 className="mt-6 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-1 text-mute">{text}</p>
      {cta && <div className="mt-6"><Btn variant="ghost" onClick={onClick}>{cta}</Btn></div>}
    </div>
  )
}

/* ---------- contextual 3D objects for articles ---------- */
export function ContextObject({ cat, y }: { cat: string; y: number }) {
  const rot = y / 10
  if (cat === 'Semiconductors') return <div style={{ transform: `rotate(${rot}deg)` }}><Chip3D size={150} spin={false} layers={2} /></div>
  if (cat === 'Cybersecurity')
    return (
      <svg width="150" height="170" viewBox="0 0 150 170" fill="none" role="img" aria-label="3D lock" style={{ transform: `perspective(500px) rotateY(${Math.sin(y / 200) * 40}deg)` }}>
        <path d="M45 75V50a30 30 0 0160 0v25" stroke="#a1a1aa" strokeWidth="8" />
        <rect x="25" y="75" width="100" height="80" fill="#17171a" stroke="#ff6a00" strokeWidth="2" />
        <rect x="31" y="81" width="88" height="68" fill="none" stroke="#333" />
        <circle cx="75" cy="106" r="9" fill="#ff6a00" style={{ filter: 'drop-shadow(0 0 12px #ff6a00)' }} />
        <rect x="72" y="110" width="6" height="22" fill="#ff6a00" />
      </svg>
    )
  if (cat === 'Robotics')
    return (
      <svg width="170" height="170" viewBox="0 0 170 170" fill="none" role="img" aria-label="3D robot arm">
        <rect x="55" y="140" width="60" height="16" fill="#17171a" stroke="#555" />
        <g style={{ transformOrigin: '85px 140px', transform: `rotate(${Math.sin(y / 180) * 18}deg)` }}>
          <rect x="78" y="70" width="14" height="72" fill="#222" stroke="#888" />
          <circle cx="85" cy="70" r="10" fill="#ff6a00" />
          <g style={{ transformOrigin: '85px 70px', transform: `rotate(${50 + Math.cos(y / 140) * 25}deg)` }}>
            <rect x="79" y="22" width="12" height="52" fill="#222" stroke="#888" />
            <rect x="72" y="14" width="26" height="10" fill="#ff6a00" />
          </g>
        </g>
      </svg>
    )
  if (cat === 'Cloud')
    return (
      <div style={{ perspective: 600 }} aria-label="3D server stack" role="img">
        <div style={{ transform: `rotateX(55deg) rotateZ(${y / 8}deg)`, transformStyle: 'preserve-3d' }} className="relative h-32 w-32">
          {[0, 1, 2, 3].map((i) => <div key={i} className="absolute inset-0 border border-orange/50 bg-card" style={{ transform: `translateZ(${i * 18}px)` }}><span className="absolute right-2 top-2 h-1.5 w-1.5 bg-orange" /></div>)}
        </div>
      </div>
    )
  const pts: [number, number][] = [[20, 40], [20, 100], [75, 20], [75, 70], [75, 120], [130, 55], [130, 105]]
  return (
    <svg width="150" height="150" viewBox="0 0 150 140" role="img" aria-label="3D neural network" style={{ transform: `rotateZ(${Math.sin(y / 220) * 8}deg)` }}>
      {pts.slice(0, 2).flatMap(([x1, y1], i) => pts.slice(2, 5).map(([x2, y2], j) => <line key={`${i}${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff6a00" strokeOpacity=".4" />))}
      {pts.slice(2, 5).flatMap(([x1, y1], i) => pts.slice(5).map(([x2, y2], j) => <line key={`b${i}${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff6a00" strokeOpacity=".4" />))}
      {pts.map(([x, y2], i) => <circle key={i} cx={x} cy={y2} r="6" fill="#ff6a00" style={{ animation: `pulse-o ${1.6 + i * 0.2}s infinite` }} />)}
    </svg>
  )
}

/* ---------- share panel ---------- */
export function SharePanel() {
  const [copied, setCopied] = useState(false)
  const nets = [['LinkedIn', 'in'], ['X', 'X'], ['WhatsApp', 'WA'], ['Facebook', 'f']]
  return (
    <div className="border border-line bg-card p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium"><Icon n="share" size={16} className="text-orange" />Share this story</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {nets.map(([n, s]) => (
          <button key={n} aria-label={`Share on ${n}`} className="group flex items-center gap-2 border border-line px-3 py-2.5 text-sm text-mute transition hover:-translate-y-0.5 hover:border-orange hover:text-white">
            <span className="grid h-6 w-6 place-items-center bg-white/10 text-[10px] font-bold group-hover:bg-orange group-hover:text-black">{s}</span>{n}
          </button>
        ))}
        <button onClick={() => { navigator.clipboard?.writeText(location.href); setCopied(true); setTimeout(() => setCopied(false), 1600) }} className={`flex items-center gap-2 border px-3 py-2.5 text-sm transition hover:-translate-y-0.5 ${copied ? 'border-orange text-orange' : 'border-line text-mute hover:border-orange hover:text-white'}`}>
          <Icon n={copied ? 'check' : 'link'} size={15} />{copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}

/* ---------- auth ---------- */
export function AuthPage({ mode, go }: { mode: 'login' | 'register'; go: Go }) {
  const reg = mode === 'register'
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return setErr('Enter a valid email address.')
    if (pw.length < 8) return setErr('Password must be at least 8 characters.')
    if (reg && !name.trim()) return setErr('Tell us your name.')
    setErr('')
    setBusy(true)
    // Real backend auth: JWT account in PostgreSQL (falls back with a clear message when offline).
    const call = reg ? api.register({ name, email, password: pw }) : api.login({ email, password: pw })
    call
      .then((d: any) => { try { localStorage.setItem('nb-token', d.token) } catch {} ; go('profile') })
      .catch((x: Error) => { setBusy(false); setErr(x?.message || 'Authentication service unavailable.') })
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="grid-bg relative hidden items-center justify-center overflow-hidden border-r border-line lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,106,0,0.18),transparent_60%)]" />
        <div className="relative px-12">
          <Chip3D size={260} layers={3} />
          <p className="mt-16 max-w-sm font-display text-3xl font-semibold leading-tight">Your Gateway to the Future of Technology.</p>
        </div>
      </div>
      <div className="flex items-center px-5 py-28">
        <form onSubmit={submit} className="page-in mx-auto w-full max-w-md" noValidate>
          <Eyebrow>{reg ? 'Join NextBit' : 'Welcome back'}</Eyebrow>
          <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95]">{reg ? <>Create your <span className="text-orange">account</span></> : <>Sign <span className="text-orange">in</span></>}</h1>
          <div className="mt-8 space-y-4">
            {reg && <label className="block text-xs text-mute">Full name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full border border-line bg-card px-4 py-3 text-base text-white outline-none focus:border-orange" /></label>}
            <label className="block text-xs text-mute">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full border border-line bg-card px-4 py-3 text-base text-white outline-none focus:border-orange" /></label>
            <label className="block text-xs text-mute">Password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1.5 w-full border border-line bg-card px-4 py-3 text-base text-white outline-none focus:border-orange" /></label>
          </div>
          {err && <div role="alert" className="mt-4 flex items-center gap-2 border border-orange/50 bg-orange/10 px-4 py-3 text-sm text-orange-2"><Icon n="shield" size={16} />{err}</div>}
          <div className="mt-6"><Btn className="w-full">{busy ? 'Connecting...' : reg ? 'Create account' : 'Sign in'}</Btn></div>
          <p className="mt-6 text-sm text-mute">
            {reg ? 'Already a member? ' : 'New to NextBit? '}
            <button type="button" onClick={() => go(reg ? 'login' : 'register')} className="link-u text-white">{reg ? 'Sign in' : 'Create an account'}</button>
          </p>
        </form>
      </div>
    </div>
  )
}

/* ---------- notifications ---------- */
export function NotificationsPage({ go }: { go: Go }) {
  const [items, setItems] = useState([
    { id: 1, t: 'New explainer live: What is an AI accelerator?', d: '2 h ago', u: true, v: 'article' as View },
    { id: 2, t: 'You are 60% through the Electronics path. Next up: Sensors.', d: 'Yesterday', u: true, v: 'learn' as View },
    { id: 3, t: 'Badge unlocked: NextBit Pioneer', d: '3 days ago', u: false, v: 'profile' as View },
    { id: 4, t: 'ESP32 Weather Station has a new parts list.', d: 'Last week', u: false, v: 'projects' as View },
  ])
  return (
    <>
      <Head eye="Inbox" title={<>Notifi<span className="text-orange">cations</span></>} />
      <div className="mx-auto max-w-[900px] px-5 py-10">
        {items.length === 0 ? <EmptyState title="No notifications." text="You are all caught up. New stories and badges will appear here." cta="Browse news" onClick={() => go('news')} /> : (
          <>
            <div className="mb-4 flex justify-between text-sm"><span className="text-mute">{items.filter((i) => i.u).length} unread</span>
              <span className="flex gap-4"><button onClick={() => setItems(items.map((i) => ({ ...i, u: false })))} className="link-u text-mute hover:text-white">Mark all read</button><button onClick={() => setItems([])} className="link-u text-mute hover:text-white">Clear</button></span></div>
            <ul className="divide-y divide-line border-y border-line">
              {items.map((i) => (
                <li key={i.id}><button onClick={() => { setItems(items.map((x) => (x.id === i.id ? { ...x, u: false } : x))); go(i.v) }} className="group flex w-full items-start gap-4 py-5 text-left">
                  <span className={`mt-2 h-2 w-2 shrink-0 ${i.u ? 'bg-orange' : 'bg-white/15'}`} aria-label={i.u ? 'Unread' : 'Read'} />
                  <span className="flex-1"><span className={`block ${i.u ? 'font-medium text-white' : 'text-mute'}`}>{i.t}</span><span className="text-xs text-mute">{i.d}</span></span>
                  <Icon n="arrow" size={16} className="mt-1 text-mute transition group-hover:translate-x-1 group-hover:text-orange" />
                </button></li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}

/* ---------- bookmarks with folders ---------- */
export function BookmarksPage({ go, saved }: { go: Go; saved: Set<string> }) {
  const types = ['Articles', 'Projects', 'Tutorials', 'Learning paths'] as const
  const [type, setType] = useState<(typeof types)[number]>('Articles')
  const [folders, setFolders] = useState(['Chips and AI', 'Hardware builds'])
  const [folder, setFolder] = useState('All')
  const [nf, setNf] = useState('')
  const [assign, setAssign] = useState<Record<string, string>>({ a1: 'Chips and AI', 'ESP32 Weather Station': 'Hardware builds' })
  const items: { k: string; t: string; m: string; v: View }[] =
    type === 'Articles' ? ARTICLES.filter((a) => saved.has(a.id) || a.id === 'a1').map((a) => ({ k: a.id, t: a.title, m: a.cat, v: 'article' as View }))
    : type === 'Projects' ? PROJECTS.slice(0, 3).map((p) => ({ k: p.t, t: p.t, m: p.diff, v: 'projects' as View }))
    : type === 'Tutorials' ? TUTS.slice(0, 3).map((p) => ({ k: p.t, t: p.t, m: p.lvl, v: 'tutorials' as View }))
    : PATHS.slice(1, 3).map((p) => ({ k: p.t, t: p.t + ' path', m: `${p.steps.length} stages`, v: 'learn' as View }))
  const shown = items.filter((i) => folder === 'All' || assign[i.k] === folder)
  return (
    <>
      <Head eye="Library" title={<>My saved <span className="text-orange">technology</span></>} />
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-10 lg:grid-cols-[240px_1fr] lg:px-10">
        <aside>
          <div className="font-mono text-[11px] uppercase tracking-widest text-orange">Folders</div>
          <ul className="mt-3 space-y-1">
            {['All', ...folders].map((f) => <li key={f}><button onClick={() => setFolder(f)} aria-pressed={folder === f} className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm transition ${folder === f ? 'bg-orange font-semibold text-black' : 'text-mute hover:bg-card hover:text-white'}`}><Icon n="folder" size={16} />{f}</button></li>)}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); if (nf.trim() && !folders.includes(nf.trim())) { setFolders([...folders, nf.trim()]); setNf('') } }} className="mt-4 flex gap-1">
            <input value={nf} onChange={(e) => setNf(e.target.value)} aria-label="New folder name" placeholder="New folder" className="min-w-0 flex-1 border border-line bg-card px-3 py-2 text-sm outline-none focus:border-orange" />
            <button aria-label="Add folder" className="border border-line px-3 text-orange hover:border-orange">+</button>
          </form>
        </aside>
        <div>
          <div className="flex gap-6 overflow-x-auto border-b border-line" role="tablist">{types.map((x) => <button key={x} role="tab" aria-selected={type === x} onClick={() => setType(x)} className={`-mb-px shrink-0 border-b-2 pb-3 text-sm transition ${type === x ? 'border-orange text-white' : 'border-transparent text-mute hover:text-white'}`}>{x}</button>)}</div>
          <div className="mt-6">
            {shown.length === 0 ? <EmptyState title="Nothing in this folder." text="Move a saved item here using the folder menu." /> : (
              <ul className="divide-y divide-line border-y border-line">
                {shown.map((i) => (
                  <li key={i.k} className="flex flex-wrap items-center gap-4 py-4">
                    <button onClick={() => go(i.v, i.k.startsWith('a') && i.k.length === 2 ? i.k : undefined)} className="group min-w-0 flex-1 text-left"><div className="font-mono text-[10px] uppercase tracking-widest text-orange">{i.m}</div><div className="font-display text-lg font-semibold group-hover:text-orange-2">{i.t}</div></button>
                    <label className="text-xs text-mute"><span className="sr-only">Move to folder</span>
                      <select value={assign[i.k] ?? ''} onChange={(e) => setAssign({ ...assign, [i.k]: e.target.value })} className="border border-line bg-card px-2 py-2 text-sm text-white outline-none focus:border-orange"><option value="">No folder</option>{folders.map((f) => <option key={f}>{f}</option>)}</select></label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ---------- tutorials ---------- */
export function TutorialsPage() {
  const [f, setF] = useState('All')
  return (
    <>
      <Head eye="Tutorials" title={<>Learn by <span className="text-orange">doing.</span></>} sub="Short, practical lessons from engineers and students." />
      <div className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10">
        <div className="flex flex-wrap gap-2">{['All', 'Beginner', 'Intermediate', 'Advanced'].map((x) => <button key={x} onClick={() => setF(x)} aria-pressed={f === x} className={`border px-4 py-2 text-sm transition ${f === x ? 'border-orange bg-orange font-semibold text-black' : 'border-line text-mute hover:text-white'}`}>{x}</button>)}</div>
        <div className="mt-8 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {TUTS.filter((t) => f === 'All' || t.lvl === f).map((t, i) => (
            <article key={t.t} className="page-in group bg-ink p-7 transition hover:bg-card">
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest"><span className="text-orange">{t.cat}</span><span className="text-mute">{t.lvl}</span></div>
              <div className="mt-8 font-display text-5xl font-bold text-white/10 transition group-hover:text-orange/40">{String(i + 1).padStart(2, '0')}</div>
              <h3 className="mt-2 font-display text-2xl font-semibold">{t.t}</h3>
              <div className="mt-4 flex items-center justify-between text-sm text-mute">{t.len}<Icon n="arrow" size={18} className="transition group-hover:translate-x-1 group-hover:text-orange" /></div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

/* ---------- error states ---------- */
export function ErrorsPage({ go }: { go: Go }) {
  const tabs = ['500', 'Offline', 'Article unavailable', 'Search error'] as const
  const [t, setT] = useState<(typeof tabs)[number]>('500')
  const copy: Record<string, [string, string, string]> = {
    '500': ['ERROR 500', 'Core meltdown.', 'Something failed on our side. Our engineers have been paged. Try again in a moment.'],
    Offline: ['NO SIGNAL', 'You are offline.', 'Saved stories are still available. We will reconnect as soon as your network returns.'],
    'Article unavailable': ['ERROR 410', 'This bit was removed.', 'The article was unpublished or moved after a correction. Browse related coverage instead.'],
    'Search error': ['SEARCH FAILED', 'Search hit a snag.', 'We could not reach the index. Check your connection and try again.'],
  }
  const [code, title, text] = copy[t]
  return (
    <>
      <Head eye="States" title={<>Error <span className="text-orange">states</span></>} />
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <div className="flex flex-wrap gap-2" role="tablist">{tabs.map((x) => <button key={x} role="tab" aria-selected={t === x} onClick={() => setT(x)} className={`border px-4 py-2 text-sm transition ${t === x ? 'border-orange bg-orange font-semibold text-black' : 'border-line text-mute hover:text-white'}`}>{x}</button>)}</div>
        <div key={t} className="page-in grid-bg mt-8 grid place-items-center border border-line px-6 py-24 text-center">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden>
            <rect x="35" y="15" width="50" height="50" stroke="#ff6a00" strokeWidth="2" />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M${45 + i * 10} 15V5M${45 + i * 10} 65v10`} stroke="#888" strokeWidth="2" />)}
            <path d="M48 28l24 24M72 28L48 52" stroke="#ff6a00" strokeWidth="3" style={{ animation: 'pulse-o 1.4s infinite' }} />
          </svg>
          <div className="mt-6 font-mono text-xs text-orange">{code}</div>
          <h2 className="mt-2 font-display text-5xl font-bold uppercase">{title}</h2>
          <p className="mt-3 max-w-md text-mute">{text}</p>
          <div className="mt-8 flex gap-3"><Btn onClick={() => go('home')}>Back home</Btn><Btn variant="ghost" onClick={() => go('news')}>Read the news</Btn></div>
        </div>
      </div>
    </>
  )
}

/* ---------- design system ---------- */
export function DesignSystem() {
  const [tab, setTab] = useState('Colors')
  const [modal, setModal] = useState(false)
  const [tab2, setTab2] = useState(0)
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setModal(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  const colors = [['Ink', '#050505'], ['Ink 2', '#0B0B0D'], ['Card', '#111113'], ['Card 2', '#17171A'], ['Mute', '#A1A1AA'], ['Orange', '#FF6A00'], ['Orange 2', '#FF8A33'], ['White', '#FFFFFF']]
  const sections = ['Colors', 'Type', 'Logo', 'Components', 'States']
  return (
    <>
      <Head eye="Design System" title={<>Build the <span className="text-orange">system.</span></>} sub="Tokens and components used across NextBit, with real examples." />
      <div className="sticky top-[68px] z-30 border-b border-line bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] gap-6 overflow-x-auto px-5 lg:px-10" role="tablist">{sections.map((s) => <button key={s} role="tab" aria-selected={tab === s} onClick={() => setTab(s)} className={`-mb-px shrink-0 border-b-2 py-4 text-sm transition ${tab === s ? 'border-orange text-white' : 'border-transparent text-mute hover:text-white'}`}>{s}</button>)}</div>
      </div>
      <div key={tab} className="page-in mx-auto max-w-[1440px] px-5 py-12 lg:px-10">
        {tab === 'Colors' && (
          <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">{colors.map(([n, c]) => <div key={n} className="bg-ink"><div className="h-28 border-b border-line" style={{ background: c }} /><div className="p-4"><div className="font-display text-lg font-semibold">{n}</div><div className="font-mono text-xs text-mute">{c}</div></div></div>)}</div>
        )}
        {tab === 'Type' && (
          <div className="divide-y divide-line border-y border-line">
            {[['Display / 96', 'font-display text-[96px] font-bold leading-none uppercase', 'Build now'], ['Heading / 48', 'font-display text-5xl font-bold', 'Understand the bit'], ['Title / 24', 'font-display text-2xl font-semibold', 'Inside the AI accelerator race'], ['Body / 18', 'text-lg text-zinc-300', 'Technology news is easier when you understand what is happening underneath.'], ['Mono / 12', 'font-mono text-xs uppercase tracking-widest text-orange', 'Category label']].map(([l, c, s]) => <div key={l} className="grid gap-2 py-6 md:grid-cols-[160px_1fr] md:items-baseline"><span className="font-mono text-xs text-mute">{l}</span><span className={c}>{s}</span></div>)}
            <div className="py-6 text-sm text-mute">Space Grotesk for headings, Inter for body, JetBrains Mono for data labels. Spacing follows a 4px scale; grid is 12 columns at 1440, 8 at 768, 4 at 390.</div>
          </div>
        )}
        {tab === 'Logo' && (
          <div className="grid gap-px bg-line md:grid-cols-4">
            {[['Full', '#050505', '#fff', false], ['Orange', '#050505', '#ff6a00', false], ['On orange', '#ff6a00', '#000', false], ['Monochrome', '#fff', '#000', false]].map(([n, bg, fg]) => (
              <div key={n as string} className="grid h-44 place-items-center" style={{ background: bg as string, color: fg as string }}>
                <span className="flex items-center gap-2.5"><LogoMark color={fg as string} /><span className="font-display text-[19px] font-bold tracking-[0.14em]">NEXTBIT</span></span>
                <span className="font-mono text-[10px] uppercase opacity-60">{n as string}</span>
              </div>
            ))}
            <div className="grid h-44 place-items-center bg-ink"><Logo compact /><span className="font-mono text-[10px] uppercase text-mute">Icon / favicon</span></div>
          </div>
        )}
        {tab === 'Components' && (
          <div className="grid gap-12 lg:grid-cols-2">
            <Block t="Buttons"><div className="flex flex-wrap gap-3"><Btn>Primary</Btn><Btn variant="ghost">Secondary</Btn></div></Block>
            <Block t="Badges"><div className="flex flex-wrap gap-2"><span className="bg-orange px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-black">AI</span><span className="border border-orange/50 px-2.5 py-1 font-mono text-[11px] uppercase text-orange">Verified</span><span className="border border-line px-2.5 py-1 font-mono text-[11px] uppercase text-mute">Draft</span></div></Block>
            <Block t="Input"><input placeholder="Search technology, ideas, projects..." className="w-full border border-line bg-card px-4 py-3 outline-none focus:border-orange" /></Block>
            <Block t="Tabs"><div className="flex gap-6 border-b border-line">{['News', 'Learn', 'Build'].map((x, i) => <button key={x} onClick={() => setTab2(i)} className={`-mb-px border-b-2 pb-3 text-sm ${tab2 === i ? 'border-orange text-white' : 'border-transparent text-mute'}`}>{x}</button>)}</div></Block>
            <Block t="Alerts"><div className="space-y-2"><div role="status" className="flex items-center gap-2 border border-orange/50 bg-orange/10 px-4 py-3 text-sm text-orange-2"><Icon n="shield" size={16} />Your changes were saved.</div><div role="alert" className="flex items-center gap-2 border border-white/20 px-4 py-3 text-sm"><Icon n="close" size={16} />Could not publish. Source is not verified.</div></div></Block>
            <Block t="Avatars & tooltip"><div className="flex items-center gap-3">{['AU', 'EH', 'DM'].map((x) => <span key={x} className="grid h-10 w-10 place-items-center bg-orange font-display text-sm font-bold text-black">{x}</span>)}<span className="group relative"><button className="border border-line px-3 py-2 text-sm text-mute">Hover or focus</button><span role="tooltip" className="pointer-events-none absolute bottom-full left-0 mb-2 whitespace-nowrap border border-line bg-card-2 px-3 py-1.5 text-xs opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">Tooltip content</span></span></div></Block>
            <Block t="Stat"><div className="font-display text-6xl font-bold text-orange"><CountUp to={12480} /></div><div className="text-sm text-mute">Active learners</div></Block>
            <Block t="Modal"><Btn variant="ghost" onClick={() => setModal(true)}>Open modal</Btn></Block>
          </div>
        )}
        {tab === 'States' && (
          <div className="grid gap-12 lg:grid-cols-2">
            <Block t="Loading skeleton"><div className="skeleton h-32" /><div className="skeleton mt-3 h-4 w-3/4" /><div className="skeleton mt-2 h-4 w-1/2" /></Block>
            <Block t="Empty"><EmptyState title="No saved stories yet." text="Bookmark a story to find it here." /></Block>
          </div>
        )}
      </div>
      {modal && (
        <div className="page-in fixed inset-0 z-[80] grid place-items-center bg-black/80 p-5 backdrop-blur-sm" onClick={() => setModal(false)}>
          <div role="dialog" aria-modal="true" aria-label="Example modal" onClick={(e) => e.stopPropagation()} className="w-full max-w-md border border-line bg-card-2 p-7">
            <h3 className="font-display text-2xl font-bold">Publish this article?</h3>
            <p className="mt-2 text-mute">It will go live to all readers and the newsletter queue.</p>
            <div className="mt-6 flex gap-3"><Btn onClick={() => setModal(false)}>Publish</Btn><Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn></div>
          </div>
        </div>
      )}
    </>
  )
}

function Block({ t, children }: { t: string; children: ReactNode }) {
  return <Reveal><div className="mb-4 font-mono text-[11px] uppercase tracking-widest text-orange">{t}</div>{children}</Reveal>
}
