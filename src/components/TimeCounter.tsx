import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeCounterProps {
  /** ISO date string or Date for when the countdown starts from */
  since?: string;
  label?: string;
}

export default function TimeCounter({
  since = '2026-04-14T00:00:00',
  label = 'Time since we last stood together',
}: TimeCounterProps) {
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const sinceDate = new Date(since).getTime();

    const update = () => {
      const now = Date.now();
      let diff = Math.max(0, now - sinceDate);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * 1000 * 60 * 60 * 24;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * 1000 * 60 * 60;
      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * 1000 * 60;
      const seconds = Math.floor(diff / 1000);

      setElapsed({ days, hours, minutes, seconds });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [since]);

  const units = [
    { value: elapsed.days, label: 'Days' },
    { value: elapsed.hours, label: 'Hours' },
    { value: elapsed.minutes, label: 'Minutes' },
    { value: elapsed.seconds, label: 'Seconds' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        textAlign: 'center',
        margin: '2rem 0',
      }}
    >
      {/* Label */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.5rem, 1vw, 0.65rem)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--gold-dim)',
          marginBottom: '1.25rem',
        }}
      >
        {label}
      </p>

      {/* Counter boxes */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(0.75rem, 2vw, 1.5rem)',
          flexWrap: 'wrap',
        }}
      >
        {units.map((unit) => (
          <div
            key={unit.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              minWidth: '60px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                fontWeight: 700,
                color: 'var(--gold)',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(201,168,76,0.15)',
                lineHeight: 1,
              }}
            >
              {String(unit.value).padStart(unit.label === 'Days' ? 1 : 2, '0')}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.45rem, 0.8vw, 0.55rem)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--cream-dim)',
                opacity: 0.6,
              }}
            >
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
