import { useEffect, useState, type ReactNode } from 'react'
import { api } from './api'
import ArticleTldr from './components/ArticleTldr'
import CodeBlock from './components/CodeBlock'
import UpvoteButton from './components/UpvoteButton'
import StatusBoard from './components/StatusBoard'
import GithubTrends from './components/GithubTrends'
import { setChatContext } from './lib/chatContext'
import { ARTICLES, IMG, PROJECTS } from './data'
import { AfricaMap, ArticleMeta, Electronics, LearnPaths, ProjectCard, Rwanda, Software, UnderstandBit } from './Home'
import { Btn, Chip3D, CountUp, Eyebrow, Icon, Reveal, Verified, type View } from './ui'
import { AUTHORS, ContextObject, SharePanel, TUTS } from './Extra'

type Go = (v: View, id?: string) => void

export function PageHead({ eye, title, sub }: { eye: string; title: ReactNode; sub?: string }) {
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

export function NewsPage({ go, saved, toggle }: { go: Go; saved: Set<string>; toggle: (id: string) => void }) {
  const cats = ['All', 'AI', 'Cybersecurity', 'Software', 'Hardware', 'Robotics', 'Africa Tech', 'Space Tech']
  const [c, setC] = useState('All')
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState<any[]>([])
  const [vcs, setVcs] = useState<Record<string, { count: number; mine: number }>>({})
  const pick = (x: string) => setC(x)
  // Live multi-source news (Google News + RSS, ranked) with graceful fallback to the editorial showcase set.
  useEffect(() => {
    let active = true
    setLoading(true)
    api.trending(c === 'All' ? 'all' : c, 60, false)
      .then((d: any) => {
        if (!active) return
        const items: any[] = d.items || []
        setLive(items)
        api.votes('story', items.map((x) => String(x.id)).slice(0, 60), localStorage.getItem('nb-voter') || '')
          .then((v: any) => active && setVcs(v)).catch(() => {})
      })
      .catch(() => active && setLive([]))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [c])
  // Designed editorial showcase used as fallback when live feeds are unavailable.
  const list = ARTICLES.filter((a) => c === 'All' || a.cat === c)
  return (
    <>
      <PageHead eye="News" title={<>The <span className="text-orange">signal.</span></>} sub="Verified technology reporting. Every story shows its source." />
      <div className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10">
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Categories">
          {cats.map((x) => <button key={x} role="tab" aria-selected={c === x} onClick={() => pick(x)} className={`shrink-0 border px-4 py-2 text-sm transition ${c === x ? 'border-orange bg-orange font-semibold text-black' : 'border-line text-mute hover:text-white'}`}>{x}</button>)}
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i}><div className="skeleton aspect-[4/3]" /><div className="skeleton mt-4 h-5 w-3/4" /><div className="skeleton mt-2 h-4 w-1/2" /></div>)
            : live.length > 0 ? live.map((item) => {
                const open = () => window.open(item.url, '_blank', 'noopener,noreferrer')
                return (
                <article key={item.id} onClick={open} className="page-in group cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden bg-card"><img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105" /></div>
                  <div className="mt-4 flex items-center justify-between"><span className="font-mono text-[11px] uppercase tracking-widest text-orange">{item.topic}</span>
                    <UpvoteButton targetId={String(item.id)} kind="story" initialCount={vcs[item.id]?.count || 0} initialMine={vcs[item.id]?.mine || 0} /></div>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight transition group-hover:text-orange-2">{item.title}</h3>
                  <p className="mt-2 text-mute">{item.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-[12px] text-mute"><span>{item.source}</span><span>{new Date(item.publishedAt).toLocaleDateString()}</span></div>
                </article>
              )}) : list.map((a) => (
                <article key={a.id} onClick={() => go('article', a.id)} className="page-in group cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden bg-card"><img src={a.img} alt="" loading="lazy" className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105" /></div>
                  <div className="mt-4 flex items-center justify-between"><span className="font-mono text-[11px] uppercase tracking-widest text-orange">{a.cat}</span>
                    <button onClick={(e) => { e.stopPropagation(); toggle(a.id) }} aria-pressed={saved.has(a.id)} aria-label="Bookmark" className={saved.has(a.id) ? 'text-orange' : 'text-mute hover:text-white'}><Icon n="bookmark" size={17} /></button></div>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight transition group-hover:text-orange-2">{a.title}</h3>
                  <p className="mt-2 text-mute">{a.summary}</p>
                  <div className="mt-3"><ArticleMeta a={a} /></div>
                </article>
              ))}
        </div>
        <div className="mt-20 grid gap-6 lg:grid-cols-2">
          <StatusBoard />
          <GithubTrends />
        </div>
      </div>
    </>
  )
}

const BODY: Record<string, { p: string[]; take: string }> = {
  a1: { p: ['For a decade, training and running AI models meant buying GPUs. That assumption is cracking. A new class of accelerators, built only for inference, claims to serve the same models at a fraction of the cost per token.', 'Running a trained model is dominated by matrix multiplication and, more importantly, by moving weights from memory to compute. General-purpose GPUs carry hardware for graphics and flexibility that inference never touches.', 'Engineers describe the problem in bytes per operation. Systolic arrays keep operands local, stacked HBM widens the pipe, and low-precision formats such as INT8 shrink what has to travel at all.'], take: 'Inference-first chips win on cost per token by attacking memory movement, not raw compute.' },
  a2: { p: ['The flaw lived in a parsing routine for configuration packets, first written more than a decade ago and copied into the firmware of dozens of consumer routers.', 'Researchers found that a malformed packet could overwrite adjacent memory and run attacker code with root privileges. Because the vendor did not know, defenders had zero days to prepare: a classic zero-day.', 'Patches began shipping this week. Until your device updates, disable remote administration and put the router behind a firewall.'], take: 'Disable remote admin on your router now, and install the firmware update as soon as it appears.' },
  a3: { p: ['Kigali has begun switching on a municipal grid of small edge data centers, placing compute a few kilometres from users instead of an ocean away.', 'Early tests by local fintech and health teams show round-trip latency falling by more than half, which matters for mobile payments and remote diagnostics.', 'City officials say the grid will be open to student teams and startups through a shared access programme.'], take: 'Edge compute in Kigali cuts latency for local apps and opens shared infrastructure to builders.' },
  a4: { p: ['In labs from Kigali to Nairobi, students are assembling robot arms from open designs and 3D-printed joints, at a fraction of the price of industrial units.', 'The arms use hobby servos and a microcontroller such as the ESP32, with inverse kinematics written in Python or C++.', 'Instructors say the biggest change is access: every student now touches real hardware, not just simulations.'], take: 'Open hardware is moving robotics from simulation into every student’s hands.' },
  a5: { p: ['Serverless platforms now let a small team run code, and even GPU workloads, without ever choosing a server.', 'Regional zones put that compute closer to users, which improves latency and helps with data residency rules.', 'The trade-off is visibility: you gain speed and lose some control, so cost monitoring becomes part of the job.'], take: 'Serverless and regional zones speed up small teams, but cost visibility becomes your job.' },
}
const initials = (n: string) => n.split(' ').map((x) => x[0]).join('')
// Renders a live editorial body: paragraphs plus fenced code blocks with syntax highlighting.
function RealBody({ body }: { body: string }) {
  const out: ReactNode[] = []
  let last = 0, i = 0
  const re = /```(\w*)\n?([\s\S]*?)```/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body))) {
    if (m.index > last) out.push(...body.slice(last, m.index).split(/\n\s*\n/).filter(Boolean).map((p, k) => <p key={`p${i}-${k}`}>{p}</p>))
    out.push(<CodeBlock key={`c${i}`} language={m[1] || 'ts'} code={m[2].replace(/\n$/, '')} />)
    last = re.lastIndex; i++
  }
  if (last < body.length) out.push(...body.slice(last).split(/\n\s*\n/).filter(Boolean).map((p, k) => <p key={`t${i}-${k}`}>{p}</p>))
  return <>{out}</>
}

export function ArticlePage({ id, go, saved, toggle }: { id: string; go: Go; saved: Set<string>; toggle: (id: string) => void }) {
  const [real, setReal] = useState<any>(null)
  const [realBody, setRealBody] = useState('')
  // Try the live editorial database first; fall back to the designed showcase set.
  useEffect(() => {
    let active = true
    setReal(null); setRealBody('')
    api.article(id)
      .then((d: any) => { if (active) { setReal(d); setRealBody(String(d.body || '')) } })
      .catch(() => {})
    return () => { active = false }
  }, [id])
  useEffect(() => {
    setChatContext(real ? [real.title, real.summary, realBody].filter(Boolean).join('\n\n') : '')
    return () => setChatContext('')
  }, [real, realBody])
  const mock = ARTICLES.find((x) => x.id === id) ?? ARTICLES[0]
  const a = real
    ? { id: real.id, cat: real.category || 'Technology', title: real.title, sub: real.summary,
        img: real.image_url || mock.img, date: real.published_at ? new Date(real.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        read: '—', author: real.author || 'NextBit Desk', source: real.source_url || 'NextBit Desk' }
    : mock
  const body = BODY[a.id] ?? { p: [], take: '' }
  const [y, setY] = useState(0)
  const [comments, setComments] = useState([{ n: 'Samuel B.', t: 'Clear and well sourced. Thanks for linking the original reports.' }, { n: 'Aline K.', t: 'Would love a follow-up with a hands-on project.' }])
  const [draft, setDraft] = useState('')
  useEffect(() => {
    const f = () => setY(window.scrollY)
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  return (
    <>
      <div className="fixed left-0 top-[68px] z-40 h-0.5 bg-orange" style={{ width: `${Math.min(100, (y / 2400) * 100)}%` }} />
      <header className="mx-auto max-w-[850px] px-5 pt-36">
        <div className="font-mono text-xs uppercase tracking-widest text-orange">{a.cat}</div>
        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.02] sm:text-6xl">{a.title}</h1>
        <p className="mt-5 text-xl leading-relaxed text-mute">{a.sub}</p>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center bg-orange font-display font-bold text-black">{initials(a.author)}</span>
            <div><div className="font-medium">{a.author}</div><div className="text-xs text-mute">{a.date} · {a.read} read</div></div>
          </div>
          <button onClick={() => toggle(a.id)} aria-pressed={saved.has(a.id)} className={`flex items-center gap-2 border px-4 py-2 text-sm transition ${saved.has(a.id) ? 'border-orange text-orange' : 'border-line text-mute hover:text-white'}`}><Icon n="bookmark" size={16} />{saved.has(a.id) ? 'Saved' : 'Save'}</button>
        </div>
        <div className="mt-6"><Verified source={a.source} /></div>
      </header>
      <div className="relative mx-auto mt-10 max-w-[1200px] px-5">
        <img src={a.img} alt={a.cat + ': ' + a.title} className="aspect-[16/8] w-full object-cover" />
        <div className="absolute -bottom-16 right-10 hidden lg:block"><ContextObject cat={a.cat} y={y} /></div>
      </div>
      {real && <div className="mx-auto mt-10 max-w-[720px] px-5"><ArticleTldr articleId={String(real.id)} text={[real.title, real.summary, realBody].filter(Boolean).join('\n\n')} /></div>}
      <article className="mx-auto max-w-[720px] px-5 py-16 text-[19px] leading-[1.8] text-zinc-300 [&_p]:mb-7">
        {real ? (
          realBody.includes('```')
            ? <RealBody body={realBody} />
            : <>{realBody.split(/\n\s*\n/).filter(Boolean).map((t, i) => <p key={i}>{t}</p>)}</>
        ) : (
          <>
            <p><span className="float-left mr-3 font-display text-7xl font-bold leading-[0.8] text-orange">{body.p[0]?.[0]}</span>{body.p[0]?.slice(1)}</p>
            {body.p.slice(1).map((t, i) => <p key={i}>{t}</p>)}
            <div className="my-10 border border-orange/40 bg-orange/5 p-6">
              <div className="font-mono text-[11px] uppercase tracking-widest text-orange">Key takeaway</div>
              <p className="mt-2 !mb-0 text-lg text-white">{body.take}</p>
            </div>
          </>
        )}
      </article>
      {a.id === 'a1' && <div className="mx-auto max-w-[1100px] px-5"><UnderstandBit /></div>}
      <div className="mx-auto max-w-[720px] px-5 pb-10">
        <SharePanel />
        <div className="mt-10 flex gap-5 border border-line bg-card p-6">
          <span className="grid h-16 w-16 shrink-0 place-items-center bg-orange font-display text-xl font-bold text-black">{initials(a.author)}</span>
          <div><div className="font-display text-xl font-semibold">{a.author}</div><p className="mt-1 text-sm text-mute">Technology reporter at NextBit Updates covering {a.cat.toLowerCase()} and the engineers behind it. Based in Kigali.</p></div>
        </div>
        <h3 className="mt-14 font-display text-2xl font-bold">Comments · {comments.length}</h3>
        <form onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { setComments([...comments, { n: 'You', t: draft }]); setDraft('') } }} className="mt-5 flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Add a comment" placeholder="Add to the discussion" className="flex-1 border border-line bg-card px-4 py-3 outline-none focus:border-orange" />
          <Btn>Post</Btn>
        </form>
        <ul className="mt-6 space-y-5">{comments.map((c, i) => <li key={i} className="border-b border-line pb-5"><div className="text-sm font-semibold">{c.n}</div><p className="mt-1 text-[15px] text-mute">{c.t}</p></li>)}</ul>
      </div>
      <section className="mx-auto max-w-[1440px] px-5 pb-24 pt-10 lg:px-10">
        <h3 className="font-display text-3xl font-bold">Related stories</h3>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {ARTICLES.filter((x) => x.id !== a.id).slice(0, 3).map((r) => <article key={r.id} onClick={() => go('article', r.id)} className="group cursor-pointer"><div className="aspect-[16/10] overflow-hidden bg-card"><img src={r.img} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div><div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-orange">{r.cat}</div><h4 className="mt-1 font-display text-lg font-semibold group-hover:text-orange-2">{r.title}</h4></article>)}
        </div>
        <h3 className="mt-14 font-display text-3xl font-bold">Build it yourself</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2"><button onClick={() => go('projects')} className="text-left"><ProjectCard p={PROJECTS[2]} /></button><button onClick={() => go('projects')} className="text-left"><ProjectCard p={PROJECTS[1]} /></button></div>
      </section>
    </>
  )
}

export function LearnPage() {
  return (
    <>
      <PageHead eye="Learn" title={<>Learn the <span className="text-orange">technology.</span></>} sub="Five structured paths. Click any stage to set where you are." />
      <LearnPaths compact />
      <div className="h-24" />
    </>
  )
}

export function BuildPage() {
  return (
    <>
      <PageHead eye="Build" title={<>Build <span className="text-orange">better.</span></>} sub="Software and hardware, one workflow." />
      <Software />
      <Electronics />
    </>
  )
}

export function ProjectsPage() {
  const lv = ['All', 'Beginner', 'Intermediate', 'Advanced']
  const [f, setF] = useState('All')
  return (
    <>
      <PageHead eye="Projects" title={<>Build <span className="text-orange">something.</span></>} sub="Practical builds with parts lists, time estimates and honest difficulty." />
      <div className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10">
        <div className="flex gap-2">{lv.map((x) => <button key={x} onClick={() => setF(x)} aria-pressed={f === x} className={`border px-4 py-2 text-sm transition ${f === x ? 'border-orange bg-orange font-semibold text-black' : 'border-line text-mute hover:text-white'}`}>{x}</button>)}</div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{PROJECTS.filter((p) => f === 'All' || p.diff === f).map((p) => <div key={p.t} className="page-in"><ProjectCard p={p} /></div>)}</div>
      </div>
    </>
  )
}

export function AfricaPage() {
  const tracks = [['Startups', 'Fintech, health and logistics teams scaling across borders.'], ['Universities', 'Labs in Kigali, Nairobi and Cape Town publishing open research.'], ['Student projects', 'Capstones that became companies.'], ['Events', 'Hackathons and developer summits across the continent.']]
  return (
    <>
      <PageHead eye="Africa Tech" title={<>Africa is <span className="text-orange">building.</span></>} />
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-10"><Reveal><AfricaMap /></Reveal>
        <div className="divide-y divide-line border-y border-line">{tracks.map(([t, d], i) => <Reveal key={t} delay={i * 70}><div className="flex gap-6 py-6"><span className="font-mono text-sm text-orange">0{i + 1}</span><div><h3 className="font-display text-2xl font-semibold">{t}</h3><p className="mt-1 text-mute">{d}</p></div></div></Reveal>)}</div></div>
      <Rwanda />
    </>
  )
}

export function ProfilePage({ go, saved }: { go: Go; saved: Set<string> }) {
  const tabs = ['Saved', 'Learning', 'Projects', 'History']
  const [t, setT] = useState('Saved')
  const badges = ['AI Explorer', 'Code Builder', 'Hardware Hacker', 'Cyber Defender', 'NextBit Pioneer']
  const earned = [true, true, false, false, true]
  const list = ARTICLES.filter((a) => saved.has(a.id))
  return (
    <>
      <div className="grid-bg border-b border-line pb-12 pt-36">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 sm:flex-row sm:items-center lg:px-10">
          <span className="grid h-28 w-28 place-items-center bg-orange font-display text-4xl font-bold text-black">JN</span>
          <div><h1 className="font-display text-4xl font-bold sm:text-6xl">Jean Nshuti</h1><p className="mt-2 max-w-lg text-mute">Computer engineering student at the University of Rwanda. Building IoT for agriculture.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">{['AI', 'ESP32', 'Cybersecurity'].map((x) => <span key={x} className="border border-line px-2.5 py-1 text-mute">{x}</span>)}</div></div>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-orange">Achievements</h2>
        <div className="mt-4 flex flex-wrap gap-3">{badges.map((b, i) => <div key={b} className={`flex items-center gap-2 border px-4 py-3 text-sm ${earned[i] ? 'border-orange/60 text-white' : 'border-line text-zinc-600'}`}><Icon n={earned[i] ? 'check' : 'shield'} size={16} className={earned[i] ? 'text-orange' : ''} />{b}{!earned[i] && <span className="text-xs">(locked)</span>}</div>)}</div>
        <div className="mt-14 flex flex-wrap items-end justify-between gap-3"><h2 className="font-display text-4xl font-bold">MY SAVED TECHNOLOGY</h2><button onClick={() => go('bookmarks')} className="link-u flex items-center gap-2 text-sm text-orange">Manage folders <Icon n="folder" size={15} /></button></div>
        <div className="mt-6 flex gap-6 border-b border-line" role="tablist">{tabs.map((x) => <button key={x} role="tab" aria-selected={t === x} onClick={() => setT(x)} className={`-mb-px border-b-2 pb-3 text-sm transition ${t === x ? 'border-orange text-white' : 'border-transparent text-mute hover:text-white'}`}>{x}</button>)}</div>
        <div className="mt-8">
          {t === 'Saved' && (list.length ? <div className="grid gap-6 md:grid-cols-3">{list.map((a) => <article key={a.id} className="page-in border-t border-line pt-4"><div className="font-mono text-[10px] uppercase tracking-widest text-orange">{a.cat}</div><h3 className="mt-2 font-display text-xl font-semibold">{a.title}</h3></article>)}</div> : <Empty title="No saved stories yet." text="Tap the bookmark on any story and it lands here." cta="Browse news" onClick={() => go('news')} />)}
          {t === 'Learning' && <div className="space-y-4">{[['Electronics', 60], ['Web Development', 80], ['AI', 35]].map(([n, p]) => <div key={n as string}><div className="mb-1 flex justify-between text-sm"><span>{n}</span><span className="text-orange"><CountUp to={p as number} suffix="%" /></span></div><div className="h-1 bg-white/10"><div className="h-full bg-orange" style={{ width: `${p}%` }} /></div></div>)}</div>}
          {t === 'Projects' && <Empty title="No projects completed yet." text="Pick a beginner build and ship your first one." cta="See projects" onClick={() => go('projects')} />}
          {t === 'History' && <ul className="divide-y divide-line">{ARTICLES.map((a) => <li key={a.id} className="flex justify-between py-3 text-sm"><span>{a.title}</span><span className="shrink-0 pl-4 text-mute">{a.date}</span></li>)}</ul>}
        </div>
      </div>
    </>
  )
}

function Empty({ title, text, cta, onClick }: { title: string; text: string; cta: string; onClick: () => void }) {
  return (
    <div className="grid place-items-center border border-dashed border-line px-6 py-16 text-center">
      <div className="opacity-60"><Chip3D size={90} spin={false} layers={1} /></div>
      <h3 className="mt-6 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-1 text-mute">{text}</p>
      <div className="mt-6"><Btn variant="ghost" onClick={onClick}>{cta}</Btn></div>
    </div>
  )
}

export function AdminPage({ go }: { go: Go }) {
  const side = [['Overview', 'grid'], ['Articles', 'news'], ['Drafts', 'edit'], ['Published', 'check'], ['Editor', 'edit'], ['Categories', 'folder'], ['Tags', 'link'], ['Authors', 'user'], ['Sources', 'shield'], ['Users', 'user'], ['Comments', 'news'], ['Projects', 'build'], ['Tutorials', 'learn'], ['Analytics', 'chart'], ['Reports', 'chart'], ['Settings', 'settings']]
  const rows: Record<string, string[][]> = {
    Drafts: [['Quantum error correction explained', 'Eric H.', 'Draft'], ['Building a Pi cluster', 'Kevin O.', 'Draft']],
    Published: ARTICLES.slice(0, 3).map((a) => [a.title, a.author, 'Published']),
    Categories: [['Semiconductors', '77 articles'], ['Cybersecurity', '98 articles'], ['Africa Tech', '120 articles'], ['Robotics', '64 articles']],
    Tags: [['inference', '41'], ['esp32', '58'], ['zero-day', '23'], ['kigali', '37']],
    Authors: AUTHORS.map((n, i) => [n, `${12 + i * 7} articles`]),
    Sources: [['IEEE Spectrum', 'Verified'], ['CERT advisory', 'Verified'], ['RISA', 'Verified'], ['Provider blogs', 'Pending']],
    Users: [['Jean Nshuti', 'Reader'], ['Aline K.', 'Contributor'], ['Amina Uwase', 'Editor']],
    Comments: [['Clear and well sourced.', 'Samuel B.', 'Approved'], ['Check the second link.', 'Chantal I.', 'Flagged']],
    Projects: PROJECTS.map((x) => [x.t, x.by, x.diff]),
    Tutorials: TUTS.map((x) => [x.t, x.cat, x.lvl]),
    Reports: [['Weekly traffic summary', 'Oct 4'], ['Source accuracy audit', 'Sep 28'], ['Newsletter growth', 'Sep 21']],
  }
  const [s, setS] = useState('Overview')
  const [step, setStep] = useState(0)
  const flow = ['Draft', 'Review', 'Verified', 'Published']
  const stats: [string, number, string][] = [['Total articles', 1284, ''], ['Views', 482, 'K'], ['Users', 12480, ''], ['Bookmarks', 9210, '']]
  const pts = [22, 30, 26, 41, 38, 52, 49, 63, 58, 74, 70, 88]
  const path = pts.map((v, i) => `${i ? 'L' : 'M'}${(i / 11) * 400} ${120 - v}`).join(' ')
  return (
    <div className="pt-[68px]">
      <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-[1440px] lg:grid-cols-[220px_1fr]">
        <aside className="flex gap-1 overflow-x-auto border-b border-line p-3 lg:flex-col lg:border-b-0 lg:border-r lg:p-5">
          {side.map(([l, ic]) => <button key={l} onClick={() => setS(l)} className={`flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm transition ${s === l ? 'bg-orange text-black' : 'text-mute hover:bg-card hover:text-white'}`}><Icon n={ic} size={17} />{l}</button>)}
          <button onClick={() => go('home')} className="mt-auto hidden px-3 py-2 text-left text-xs text-mute hover:text-white lg:block">← Back to site</button>
        </aside>
        <main key={s} className="page-in p-5 lg:p-10">
          <h1 className="font-display text-4xl font-bold">{s}</h1>
          {s === 'Overview' && (
            <>
              <div className="mt-8 grid grid-cols-2 gap-px bg-line lg:grid-cols-4">{stats.map(([l, n, x]) => <div key={l} className="bg-ink p-5"><div className="text-xs text-mute">{l}</div><div className="mt-2 font-display text-3xl font-bold text-orange"><CountUp to={n} suffix={x} /></div></div>)}</div>
              <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <div className="border border-line bg-card p-5"><div className="mb-3 text-sm text-mute">Views, last 12 weeks</div>
                  <svg viewBox="0 0 400 130" className="w-full" role="img" aria-label="Line chart of weekly views rising steadily"><path d={path + ' L400 130 L0 130Z'} fill="rgba(255,106,0,0.12)" /><path d={path} fill="none" stroke="#ff6a00" strokeWidth="2" /></svg></div>
                <div className="border border-line bg-card p-5"><div className="mb-4 text-sm text-mute">Trending topics</div>{[['AI', 88], ['Cybersecurity', 64], ['Africa Tech', 52], ['Robotics', 37]].map(([n, v]) => <div key={n as string} className="mb-3"><div className="mb-1 flex justify-between text-sm"><span>{n}</span><span className="text-mute">{v}</span></div><div className="h-1 bg-white/10"><div className="h-full bg-orange" style={{ width: `${v}%` }} /></div></div>)}</div>
              </div>
            </>
          )}
          {s === 'Articles' && (
            <table className="mt-8 w-full text-left text-sm"><thead className="font-mono text-[11px] uppercase tracking-widest text-mute"><tr><th className="py-3">Title</th><th className="hidden sm:table-cell">Category</th><th>Status</th></tr></thead>
              <tbody>{ARTICLES.map((a, i) => <tr key={a.id} onClick={() => setS('Editor')} className="cursor-pointer border-t border-line hover:bg-card"><td className="py-4 pr-4">{a.title}</td><td className="hidden text-mute sm:table-cell">{a.cat}</td><td><span className={`border px-2 py-0.5 text-xs ${i < 3 ? 'border-orange/50 text-orange' : 'border-line text-mute'}`}>{i < 3 ? 'Published' : 'Review'}</span></td></tr>)}</tbody></table>
          )}
          {s === 'Editor' && (
            <div className="mt-8">
              <ol className="grid grid-cols-4 gap-1" aria-label="Editorial workflow">{flow.map((f, i) => <li key={f}><button onClick={() => setStep(i)} className="w-full text-left"><div className={`h-1 transition-colors ${i <= step ? 'bg-orange' : 'bg-white/10'}`} /><div className={`mt-2 font-mono text-[11px] uppercase tracking-widest ${i <= step ? 'text-orange' : 'text-mute'}`}>{i + 1}. {f}</div></button></li>)}</ol>
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {['Title', 'Subtitle', 'Category', 'Tags', 'Author', 'Source', 'SEO title', 'SEO description'].map((f) => <label key={f} className="block text-xs text-mute">{f}<input defaultValue={f === 'Title' ? ARTICLES[0].title : f === 'Author' ? 'Amina Uwase' : ''} className="mt-1.5 w-full border border-line bg-card px-3 py-2.5 text-sm text-white outline-none focus:border-orange" /></label>)}
                <label className="block text-xs text-mute lg:col-span-2">Content<textarea rows={6} defaultValue="For a decade, training and running AI models meant buying GPUs..." className="mt-1.5 w-full border border-line bg-card px-3 py-2.5 text-sm text-white outline-none focus:border-orange" /></label>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-orange" /> Featured article</label>
                <div className="ml-auto"><Btn onClick={() => setStep(Math.min(3, step + 1))}>{step === 3 ? 'Published' : `Move to ${flow[step + 1]}`}</Btn></div></div>
            </div>
          )}
          {s === 'Analytics' && <div className="mt-8 grid gap-px bg-line sm:grid-cols-3">{[['Avg. read time', '4:12'], ['Return visitors', '38%'], ['Top source', 'Newsletter']].map(([l, v]) => <div key={l} className="bg-ink p-6"><div className="text-xs text-mute">{l}</div><div className="mt-2 font-display text-3xl font-bold text-orange">{v}</div></div>)}</div>}
          {rows[s] && <table className="mt-8 w-full text-left text-sm"><tbody>{rows[s].map((r, i) => <tr key={i} className="border-t border-line hover:bg-card">{r.map((c, j) => <td key={j} className={`py-4 pr-4 ${j === 0 ? '' : 'text-mute'}`}>{c}</td>)}</tr>)}</tbody></table>}
          {s === 'Settings' && <div className="mt-8 max-w-md space-y-4">{['Site name', 'Default author', 'Newsletter day'].map((f) => <label key={f} className="block text-xs text-mute">{f}<input defaultValue={f === 'Site name' ? 'NextBit Updates' : ''} className="mt-1.5 w-full border border-line bg-card px-3 py-2.5 text-sm text-white outline-none focus:border-orange" /></label>)}<label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="accent-orange" /> Require verified source before publish</label></div>}
        </main>
      </div>
    </div>
  )
}

export function NotFound({ go }: { go: Go }) {
  return (
    <div className="grid-bg grid min-h-screen place-items-center px-5 text-center">
      <div>
        <div className="font-mono text-sm text-orange">ERROR 404</div>
        <h1 className="mt-4 font-display text-[clamp(3.5rem,13vw,10rem)] font-bold uppercase leading-[0.85]">Bit not<br /><span className="text-orange">found.</span></h1>
        <p className="mx-auto mt-6 max-w-md text-mute">The signal dropped somewhere between here and there. Let’s get you back online.</p>
        <div className="mt-8 flex justify-center gap-3"><Btn onClick={() => go('home')}>Back home</Btn><Btn variant="ghost" onClick={() => go('news')}>Read the news</Btn></div>
      </div>
    </div>
  )
}

export { IMG }
