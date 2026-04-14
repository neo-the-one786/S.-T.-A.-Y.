import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const letters = ['S', 'T', 'A', 'Y'];

export default function StayReveal() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    letters.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleCount(i + 1), 400 + i * 300)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ position: 'relative', marginBottom: '3rem' }}>
      {/* Wormhole ring behind */}
      <div className="wormhole-ring" />

      {/* Letters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'clamp(1rem, 4vw, 2.5rem)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <AnimatePresence>
          {letters.map((letter, i) =>
            i < visibleCount ? (
              <motion.span
                key={letter}
                initial={{ opacity: 0, y: 60, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(4rem, 12vw, 9rem)',
                  fontWeight: 300,
                  letterSpacing: '0.05em',
                  background: 'linear-gradient(180deg, var(--gold-bright) 0%, var(--gold) 50%, var(--gold-dim) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 30px rgba(201,168,76,0.3))',
                  lineHeight: 1,
                }}
              >
                {letter}
              </motion.span>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
