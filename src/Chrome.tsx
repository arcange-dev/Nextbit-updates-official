import { useEffect, useState } from 'react'
import { ARTICLES, PROJECTS, TOPICS } from './data'
import { api } from './api'
import { AUTHORS, TUTS } from './Extra'
import { Btn, Icon, Logo, LogoMark, Reveal, type View } from './ui'

export function Loader({ done }: { done: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-ink transition-all duration-700 ${done ? 'pointer-events-none opacity-0 blur-md' : ''}`}
      aria-hidden={done}
    >
      <div className="relative overflow-hidden">
        <Logo />
        <span className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-orange to-transparent mix-blend-overlay" style={{ animation: 'sweep 1.1s var(--ease-cine) infinite' }} />
      </div>
    </div>
  )
}

const LINKS: { l: string; v: View }[] = [
  { l: 'News', v: 'news' },
  { l: 'Learn', v: 'learn' },
  { l: 'Build', v: 'build' },
  { l: 'Africa Tech', v: 'africa' },
  { l: 'Projects', v: 'projects' },
  { l: 'AI Tools', v: 'directory' },
]

export function Nav({ view, go, openSearch, saved }: { view: View; go: (v: View, id?: string) => void; openSearch: () => void; saved: number }) {
  const [sc, setSc] = useState(false)
  const [menu, setMenu] = useState(false)
  const [notif, setNotif] = useState(false)
  useEffect(() => {
    const f = () => setSc(window.scrollY > 24)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  const nav = (v: View) => {
    setMenu(false)
    go(v)
  }
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${sc ? 'border-b border-line bg-ink/70 shadow-[0_10px_40px_-20px_#000] backdrop-blur-xl' : 'border-b border-transparent'}`}>
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 lg:px-10">
          <button onClick={() => nav('home')} aria-label="NextBit home">
            <span className="hidden sm:block"><Logo /></span>
            <span className="sm:hidden"><Logo compact /></span>
          </button>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {LINKS.map((k) => (
              <button key={k.l} onClick={() => nav(k.v)} className={`relative py-2 text-[14px] font-medium transition-colors ${view === k.v ? 'text-white' : 'text-mute hover:text-white'}`}>
                {k.l}
                <span className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-orange transition-transform duration-500 ${view === k.v ? 'scale-x-100' : 'scale-x-0'}`} />
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={openSearch} aria-label="Search" className="grid h-10 w-10 place-items-center text-mute transition hover:text-orange"><Icon n="search" /></button>
            <button onClick={() => nav('bookmarks')} aria-label="Bookmarks" className="relative hidden h-10 w-10 place-items-center text-mute transition hover:text-orange sm:grid">
              <Icon n="bookmark" />
              {saved > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center bg-orange px-1 text-[10px] font-bold text-black">{saved}</span>}
            </button>
            <div className="relative hidden sm:block">
              <button onClick={() => setNotif(!notif)} aria-label="Notifications" aria-expanded={notif} className="grid h-10 w-10 place-items-center text-mute transition hover:text-orange"><Icon n="bell" /></button>
              {notif && (
                <div className="page-in absolute right-0 top-12 w-72 border border-line bg-card-2 p-4 text-sm shadow-2xl">
                  <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-orange">Notifications</div>
                  <p className="text-mute">New: <span className="text-white">AI accelerator explainer</span> is live.</p>
                  <p className="mt-2 text-mute">Your path <span className="text-white">Electronics</span> is 60% complete.</p>
                  <button onClick={() => { setNotif(false); nav('notifications') }} className="link-u mt-4 text-orange">View all</button>
                </div>
              )}
            </div>
            <button onClick={() => nav('login')} aria-label="Sign in or profile" className="hidden h-10 w-10 place-items-center text-mute transition hover:text-orange sm:grid"><Icon n="user" /></button>
            <button onClick={() => nav('news')} className="group ml-2 hidden items-center gap-2 bg-orange px-5 py-2.5 text-[13px] font-semibold text-black transition-all duration-300 hover:bg-orange-2 hover:shadow-[0_6px_30px_-6px_rgba(255,106,0,0.8)] xl:flex">
              Explore Technology <Icon n="arrow" size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={() => setMenu(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center lg:hidden"><Icon n="menu" /></button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="page-in fixed inset-0 z-[60] bg-ink/95 p-6 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <Logo />
            <button onClick={() => setMenu(false)} aria-label="Close menu"><Icon n="close" size={26} /></button>
          </div>
          <div className="mt-12 flex flex-col gap-1">
            {[...LINKS, { l: 'Tutorials', v: 'tutorials' as View }, { l: 'Saved', v: 'bookmarks' as View }, { l: 'Profile', v: 'profile' as View }, { l: 'Sign in', v: 'login' as View }].map((k, i) => (
              <button key={k.l} onClick={() => nav(k.v)} className="flex items-center justify-between border-b border-line py-3 text-left font-display text-3xl font-semibold" style={{ animation: `pageIn .5s ${i * 60}ms var(--ease-cine) both` }}>
                {k.l}
                <Icon n="arrow" className="text-orange" />
              </button>
            ))}
          </div>
        </div>
      )}

      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line bg-ink/85 backdrop-blur-xl lg:hidden">
        {([['Home', 'home', 'home'], ['News', 'news', 'news'], ['Learn', 'learn', 'learn'], ['Build', 'build', 'build'], ['Profile', 'profile', 'user']] as const).map(([l, v, ic]) => (
          <button key={l} onClick={() => nav(v)} className={`flex flex-col items-center gap-1 py-3 text-[11px] ${view === v ? 'text-orange' : 'text-mute'}`}>
            <Icon n={ic} size={20} />
            {l}
          </button>
        ))}
      </nav>
    </>
  )
}

const SUGGEST = ['AI accelerator', 'ESP32 weather station', 'zero-day', 'Rwanda startups', 'Raspberry Pi']

export function SearchOverlay({ onClose, go }: { onClose: () => void; go: (v: View, id?: string) => void }) {
  const [q, setQ] = useState('')
  const [ph, setPh] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPh((p) => (p + 1) % SUGGEST.length), 2200)
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => {
      clearInterval(t)
      window.removeEventListener('keydown', k)
    }
  }, [onClose])
  const ql = q.toLowerCase()
  const arts = ARTICLES.filter((a) => (a.title + a.cat).toLowerCase().includes(ql))
  const projs = PROJECTS.filter((p) => (p.t + p.tech).toLowerCase().includes(ql))
  const tuts = TUTS.filter((t) => (t.t + t.cat).toLowerCase().includes(ql))
  const tops = TOPICS.filter((t) => t.t.toLowerCase().includes(ql))
  const auths = AUTHORS.filter((n) => n.toLowerCase().includes(ql))
  const jump = (v: View, id?: string) => {
    onClose()
    go(v, id)
  }
  return (
    <div className="page-in fixed inset-0 z-[70] overflow-y-auto bg-ink/95 backdrop-blur-2xl" role="dialog" aria-label="Search">
      <div className="mx-auto max-w-[900px] px-5 pb-20 pt-24">
        <button onClick={onClose} aria-label="Close search" className="absolute right-5 top-5 grid h-11 w-11 place-items-center border border-line hover:border-orange"><Icon n="close" /></button>
        <div className="flex items-center gap-4 border-b border-white/20 pb-4 focus-within:border-orange">
          <Icon n="search" size={28} className="text-orange" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search technology, ideas, projects..." aria-label="Search" className="w-full bg-transparent font-display text-3xl outline-none placeholder:text-zinc-600 sm:text-5xl" />
        </div>
        {!q && (
          <div className="mt-8">
            <div className="font-mono text-[11px] uppercase tracking-widest text-mute">Try searching for</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGEST.map((s, i) => (
                <button key={s} onClick={() => setQ(s)} className={`border px-4 py-2 text-sm transition ${i === ph ? 'border-orange text-orange' : 'border-line text-mute hover:text-white'}`}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {q && (
          <div className="mt-10 space-y-10">
            <section>
              <h3 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-orange">Articles · {arts.length}</h3>
              {arts.map((a) => (
                <button key={a.id} onClick={() => jump('article', a.id)} className="group flex w-full items-center justify-between gap-4 border-b border-line py-4 text-left">
                  <span className="font-display text-xl group-hover:text-orange">{a.title}</span>
                  <Icon n="arrow" className="shrink-0 transition group-hover:translate-x-1 group-hover:text-orange" />
                </button>
              ))}
            </section>
            <section>
              <h3 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-orange">Projects · {projs.length}</h3>
              {projs.map((p) => (
                <button key={p.t} onClick={() => jump('projects')} className="group flex w-full justify-between border-b border-line py-4 text-left">
                  <span className="font-display text-xl group-hover:text-orange">{p.t}</span>
                  <span className="text-sm text-mute">{p.diff}</span>
                </button>
              ))}
            </section>
            <section>
              <h3 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-orange">Tutorials · {tuts.length}</h3>
              {tuts.map((t) => (
                <button key={t.t} onClick={() => jump('tutorials')} className="group flex w-full justify-between border-b border-line py-4 text-left">
                  <span className="font-display text-xl group-hover:text-orange">{t.t}</span><span className="text-sm text-mute">{t.lvl}</span>
                </button>
              ))}
            </section>
            <section>
              <h3 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-orange">Topics and authors · {tops.length + auths.length}</h3>
              <div className="flex flex-wrap gap-2">
                {tops.map((t) => <button key={t.t} onClick={() => jump('news')} className="border border-line px-4 py-2 text-sm hover:border-orange hover:text-orange">{t.t}</button>)}
                {auths.map((n) => <button key={n} onClick={() => jump('news')} className="flex items-center gap-2 border border-line px-4 py-2 text-sm hover:border-orange hover:text-orange"><Icon n="user" size={14} />{n}</button>)}
              </div>
            </section>
            {arts.length + projs.length + tuts.length + tops.length + auths.length === 0 && (
              <div className="border border-dashed border-line p-12 text-center">
                <div className="font-display text-3xl">No bits found.</div>
                <p className="mt-2 text-mute">Nothing matches “{q}”. Try a broader term like AI or Arduino.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function Newsletter() {
  const [ok, setOk] = useState(false)
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return
    api.subscribe(email)
      .then(() => setOk(true))
      .catch((err: Error) => setMsg(err?.message || 'Subscription service unavailable — try again later.'))
  }
  return (
    <section className="border-y border-line bg-ink-2">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:px-10">
        <Reveal>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-orange">Newsletter</div>
          <h2 className="mt-4 font-display text-5xl font-bold leading-[0.95] sm:text-6xl">THE NEXTBIT <span className="text-orange">BRIEF</span></h2>
          <p className="mt-4 max-w-md text-mute">Get the most important technology stories in your inbox.</p>
        </Reveal>
        <Reveal delay={120}>
          {ok ? (
            <div className="page-in flex items-center gap-3 border border-orange/50 p-5"><Icon n="check" className="text-orange" /> You are on the list. First Brief lands Monday.</div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="em">Email</label>
              <input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="flex-1 border border-white/15 bg-card px-5 py-3.5 outline-none transition focus:border-orange" />
              <Btn>Subscribe</Btn>
            </form>
          )}
          {msg && <p role="alert" className="mt-3 text-xs text-orange-2">{msg}</p>}
          <p className="mt-3 text-xs text-mute">One email a week. No spam. Unsubscribe anytime.</p>
        </Reveal>
      </div>
    </section>
  )
}

export function Footer({ go }: { go: (v: View, id?: string) => void }) {
  const cols: [string, View][] = [['News', 'news'], ['Learn', 'learn'], ['Build', 'build'], ['Projects', 'projects'], ['Africa Tech', 'africa']]
  return (
    <footer className="relative overflow-hidden bg-ink pb-24 lg:pb-0">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(transparent,#000_40%)]" />
      <div className="relative mx-auto max-w-[1440px] px-5 pt-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm font-display text-2xl leading-tight">Your Gateway to the Future of Technology.</p>
            <div className="mt-6 flex gap-2">
              {['in', 'X', 'WA', 'f'].map((s) => (
                <a key={s} href="#" onClick={(e) => e.preventDefault()} aria-label={s} className="grid h-10 w-10 place-items-center border border-line text-xs font-semibold text-mute transition hover:border-orange hover:text-orange">{s}</a>
              ))}
            </div>
          </div>
          <ul className="space-y-3">
            {cols.map(([l, v]) => (
              <li key={l}><button onClick={() => go(v)} className="link-u text-mute transition hover:text-white">{l}</button></li>
            ))}
          </ul>
          <ul className="space-y-3 text-mute">
            {['About', 'Contact', 'Privacy', 'Terms'].map((l) => (
              <li key={l}><a href="#" onClick={(e) => e.preventDefault()} className="link-u hover:text-white">{l}</a></li>
            ))}
            {([['Tutorials', 'tutorials'], ['Saved', 'bookmarks'], ['Sign in', 'login'], ['Admin dashboard', 'admin'], ['Design system', 'design'], ['Error states', 'errors']] as const).map(([l, v]) => <li key={l}><button onClick={() => go(v)} className="link-u hover:text-white">{l}</button></li>)}
            <li><button onClick={() => go('notfound')} className="link-u text-xs hover:text-white">Lost? Try a bad link</button></li>
          </ul>
        </div>
        <div className="mt-16 select-none font-display text-[22vw] font-bold leading-[0.8] tracking-tighter stroke-text lg:text-[17vw]">NEXTBIT</div>
        <div className="flex flex-col justify-between gap-2 border-t border-line py-6 text-xs text-mute sm:flex-row">
          <span>© 2026 NextBit Updates. Built in Kigali.</span>
          <span className="flex items-center gap-2"><LogoMark size={14} /> All systems operational</span>
        </div>
      </div>
    </footer>
  )
}
