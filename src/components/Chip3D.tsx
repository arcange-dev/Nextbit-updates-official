// Rotating 3D AI chip, built from stacked CSS layers (kept from the Figma design kit).
export default function Chip3D({ layers = 3, size = 220, spin = true, className = "" }: { layers?: number; size?: number; spin?: boolean; className?: string }) {
  const slabs = Array.from({ length: 8 });
  const pins = Array.from({ length: 12 });
  return (
    <div style={{ perspective: 1200, width: size, height: size }} className={`relative ${className}`}>
      <div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d", animation: spin ? "spinY 28s linear infinite" : undefined, transform: "rotateX(62deg) rotateZ(30deg)" }}
      >
        {slabs.map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 border border-white/10"
            style={{ transform: `translateZ(${i * 3}px)`, background: i === 7 ? "linear-gradient(135deg,#2a2a2e,#0e0e10)" : "#141416" }}
          />
        ))}
        {pins.map((_, i) => (
          <span key={"t" + i} className="absolute h-3 w-[3px] bg-zinc-400" style={{ left: `${10 + i * 7}%`, top: -10, transform: "translateZ(10px)" }} />
        ))}
        {pins.map((_, i) => (
          <span key={"b" + i} className="absolute h-3 w-[3px] bg-zinc-400" style={{ left: `${10 + i * 7}%`, bottom: -10, transform: "translateZ(10px)" }} />
        ))}
        {pins.map((_, i) => (
          <span key={"l" + i} className="absolute h-[3px] w-3 bg-zinc-400" style={{ top: `${10 + i * 7}%`, left: -10, transform: "translateZ(10px)" }} />
        ))}
        {pins.map((_, i) => (
          <span key={"r" + i} className="absolute h-[3px] w-3 bg-zinc-400" style={{ top: `${10 + i * 7}%`, right: -10, transform: "translateZ(10px)" }} />
        ))}
        <div
          className="absolute inset-[22%] border border-orange/60 bg-black"
          style={{ transform: "translateZ(28px)", boxShadow: "0 0 60px rgba(255,106,0,0.55), inset 0 0 30px rgba(255,106,0,0.4)" }}
        >
          <div className="grid h-full w-full gap-[3px] p-1.5" style={{ gridTemplateColumns: `repeat(${layers + 2},1fr)` }}>
            {Array.from({ length: (layers + 2) ** 2 }).map((_, i) => (
              <span key={i} className="bg-orange" style={{ opacity: 0.25 + ((i * 37) % 70) / 100, animation: `pulse-o ${2 + (i % 5) * 0.4}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
        <div className="absolute inset-[40%] bg-orange-2/80 blur-[2px]" style={{ transform: "translateZ(40px)" }} />
      </div>
    </div>
  );
}
