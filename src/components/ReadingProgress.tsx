import { useEffect, useRef } from "react";

// Reading Progress Bar — fixed neon gradient bar tracking scroll depth.
// requestAnimationFrame-throttled passive scroll listener: ~0 cost.
export default function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        if (bar.current) bar.current.style.width = `${max > 0 ? (h.scrollTop / max) * 100 : 0}%`;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-line/40">
      <div ref={bar} className="h-full w-0 bg-gradient-to-r from-neon via-cyber to-plasma glow-neon" />
    </div>
  );
}
