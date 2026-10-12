import { Component, type ReactNode } from "react";

// App-wide error boundary: catches render/runtime errors and shows the 500
// recovery view instead of a blank page.
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="page grid min-h-screen place-items-center px-5 pt-24">
        <div className="glass-card max-w-lg p-10 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[.3em] text-orange">500 · Signal lost</div>
          <h1 className="mt-4 font-display text-4xl font-bold">Something broke on our side.</h1>
          <p className="mt-4 text-sm leading-7 text-zinc-500">{this.state.error.message || "An unexpected error occurred."}</p>
          <button onClick={() => { this.setState({ error: null }); location.hash = "#/home"; }} className="liquid-button mt-6">Back to NextBit home</button>
        </div>
      </main>
    );
  }
}

// 404 view for unknown routes.
export function NotFound({ go }: { go: (v: any, id?: string) => void }) {
  return (
    <main className="page grid min-h-screen place-items-center px-5 pt-24">
      <div className="glass-card max-w-lg p-10 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[.3em] text-orange">404 · Off the map</div>
        <h1 className="mt-4 font-display text-6xl font-bold">BIT NOT FOUND.</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-500">This page does not exist, moved, or never made it out of the newsroom.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => go("home")} className="liquid-button">Go home</button>
          <button onClick={() => go("search")} className="liquid-button ghost">Search NextBit</button>
        </div>
      </div>
    </main>
  );
}
