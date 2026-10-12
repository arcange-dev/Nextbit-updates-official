import { useCallback, useEffect, useState } from 'react'
import { Footer, Loader, Nav, Newsletter, SearchOverlay } from './Chrome'
import { AfricaSection, AskAI, Breaking, Electronics, Hero, LearnPaths, Projects, Rwanda, Software, Ticker, Trending, UnderstandBit } from './Home'
import { AuthPage, BookmarksPage, DesignSystem, ErrorsPage, NotificationsPage, TutorialsPage } from './Extra'
import { AdminPage, AfricaPage, ArticlePage, BuildPage, LearnPage, NewsPage, NotFound, PageHead, ProfilePage, ProjectsPage } from './Pages'
import { Eyebrow, type View } from './ui'
import AIDirectory from './components/AIDirectory'
import EventCalendar from './components/EventCalendar'
import ChatAssistant from './components/ChatAssistant'

const VIEWS: View[] = ['home', 'news', 'article', 'learn', 'build', 'projects', 'africa', 'profile', 'admin', 'notfound', 'login', 'register', 'design', 'errors', 'bookmarks', 'notifications', 'tutorials', 'directory']

function parse(): { view: View; id: string } {
  const [v, id] = location.hash.replace(/^#\/?/, '').split('/')
  if (!v) return { view: 'home', id: 'a1' }
  return { view: VIEWS.includes(v as View) ? (v as View) : 'notfound', id: id || 'a1' }
}

function loadSaved(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem('nb-saved') || '[]')) } catch { return new Set() }
}

export default function App() {
  const [route, setRoute] = useState(parse)
  const [search, setSearch] = useState(false)
  const [ready, setReady] = useState(false)
  const [saved, setSaved] = useState<Set<string>>(loadSaved)
  const { view, id } = route

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1300)
    const h = () => {
      setRoute(parse())
      window.scrollTo({ top: 0 })
    }
    // Ctrl/Cmd+K opens the global search overlay
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch((s) => !s) }
    }
    window.addEventListener('hashchange', h)
    window.addEventListener('keydown', k)
    return () => {
      clearTimeout(t)
      window.removeEventListener('hashchange', h)
      window.removeEventListener('keydown', k)
    }
  }, [])

  const go = useCallback((v: View, aid?: string) => {
    const next = `#/${v}${aid ? '/' + aid : ''}`
    if (location.hash === next) window.scrollTo({ top: 0 })
    else location.hash = next
  }, [])
  const toggle = (sid: string) =>
    setSaved((s) => {
      const n = new Set(s)
      n.has(sid) ? n.delete(sid) : n.add(sid)
      try { localStorage.setItem('nb-saved', JSON.stringify([...n])) } catch {}
      return n
    })

  const bare = view === 'login' || view === 'register' || view === 'notfound'

  return (
    <div className="min-h-screen bg-ink text-white">
      <Loader done={ready} />
      <Nav view={view} go={go} openSearch={() => setSearch(true)} saved={saved.size} />
      {search && <SearchOverlay onClose={() => setSearch(false)} go={go} />}
      <main key={view + id} className="page-in pb-16 lg:pb-0">
        {view === 'home' && (
          <>
            <Hero go={go} />
            <Ticker />
            <Breaking go={go} saved={saved} toggle={toggle} />
            <Trending />
            <UnderstandBit />
            <AskAI />
            <Software />
            <Electronics />
            <Projects go={go} />
            <LearnPaths />
            <section className="mx-auto max-w-[1440px] px-5 py-20 lg:px-10">
              <Eyebrow>Dev radar</Eyebrow>
              <h2 className="mt-4 font-display text-4xl font-bold sm:text-6xl">Hackathons, releases & meetups.</h2>
              <div className="mt-8"><EventCalendar /></div>
            </section>
            <AfricaSection go={go} />
            <Rwanda />
          </>
        )}
        {view === 'news' && <NewsPage go={go} saved={saved} toggle={toggle} />}
        {view === 'article' && <ArticlePage id={id} go={go} saved={saved} toggle={toggle} />}
        {view === 'directory' && (
          <>
            <PageHead eye="Dev tools" title={<>Live AI <span className="text-orange">directory.</span></>} sub="Track and upvote the AI tools that matter — LLMs, coding agents, local models and serving engines." />
            <div className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10"><AIDirectory /></div>
          </>
        )}
        {view === 'learn' && <LearnPage />}
        {view === 'build' && <BuildPage />}
        {view === 'projects' && <ProjectsPage />}
        {view === 'africa' && <AfricaPage />}
        {view === 'profile' && <ProfilePage go={go} saved={saved} />}
        {view === 'admin' && <AdminPage go={go} />}
        {view === 'notfound' && <NotFound go={go} />}
        {view === 'login' && <AuthPage mode="login" go={go} />}
        {view === 'register' && <AuthPage mode="register" go={go} />}
        {view === 'design' && <DesignSystem />}
        {view === 'errors' && <ErrorsPage go={go} />}
        {view === 'bookmarks' && <BookmarksPage go={go} saved={saved} />}
        {view === 'notifications' && <NotificationsPage go={go} />}
        {view === 'tutorials' && <TutorialsPage />}
      </main>
      {!bare && view !== 'admin' && <Newsletter />}
      {view !== 'admin' && view !== 'login' && view !== 'register' && <Footer go={go} />}
      <ChatAssistant />
    </div>
  )
}
