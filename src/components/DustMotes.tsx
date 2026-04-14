import { useMemo } from 'react';

interface Mote {
  id: number;
  left: string;
  width: number;
  opacity: number;
  duration: number;
  delay: number;
  sway: number;
}

export default function DustMotes({ count = 35 }: { count?: number }) {
  const motes = useMemo<Mote[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      width: Math.random() * 3 + 1,
      opacity: Math.random() * 0.35 + 0.1,
      duration: Math.random() * 12 + 10,
      delay: Math.random() * 15,
      sway: (Math.random() - 0.5) * 60,
    }));
  }, [count]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', overflow: 'hidden' }}
      aria-hidden="true"
    >
      {motes.map((m) => (
        <div
          key={m.id}
          className="dust-mote"
          style={{
            left: m.left,
            width: m.width,
            height: m.width,
            ['--mote-opacity' as string]: m.opacity,
            ['--mote-duration' as string]: `${m.duration}s`,
            ['--mote-delay' as string]: `${m.delay}s`,
            ['--mote-sway' as string]: `${m.sway}px`,
          }}
        />
      ))}
    </div>
  );
}
