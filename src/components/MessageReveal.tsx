import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const messages = [
  {
    text: '"The stars don\'t disappear at dawn — they\'re just waiting on the other side of the sky."',
    style: 'italic' as const,
  },
  {
    text: 'College ends. We part. But this isn\'t a goodbye.',
    style: 'normal' as const,
  },
  {
    text: 'It\'s a promise.',
    style: 'bold' as const,
  },
  {
    text: 'Like Cooper reaching across dimensions, through the fabric of space and time itself, just to say one word…',
    style: 'normal' as const,
  },
  {
    text: '... - .- -.--',
    style: 'mono' as const,
  },
  {
    text: 'Across every midnight. Through every silence. Beyond every mile between us.',
    style: 'normal' as const,
  },
  {
    text: 'I will find my way back to you.',
    style: 'bold-italic' as const,
  },
  {
    text: '— Always & forever ∞',
    style: 'signature' as const,
  },
];

export default function MessageReveal() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    messages.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleCount(i + 1), 800 + i * 900)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const getStyle = (style: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontFamily: 'var(--font-serif)',
      fontSize: 'clamp(0.95rem, 2.2vw, 1.2rem)',
      lineHeight: 1.8,
      color: 'var(--cream)',
      maxWidth: '520px',
      margin: '0 auto',
    };

    switch (style) {
      case 'italic':
        return { ...base, fontStyle: 'italic', opacity: 0.85 };
      case 'bold':
        return { ...base, fontWeight: 600, color: 'var(--gold-bright)', fontSize: 'clamp(1.05rem, 2.5vw, 1.35rem)' };
      case 'bold-italic':
        return {
          ...base,
          fontWeight: 600,
          fontStyle: 'italic',
          fontSize: 'clamp(1.15rem, 2.8vw, 1.5rem)',
          background: 'linear-gradient(180deg, var(--gold-bright) 0%, var(--gold) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 15px rgba(201,168,76,0.2))',
        };
      case 'mono':
        return {
          ...base,
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
          color: 'var(--gold)',
          letterSpacing: '0.2em',
        };
      case 'signature':
        return {
          ...base,
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)',
          color: 'var(--gold-dim)',
          letterSpacing: '0.15em',
          marginTop: '1rem',
        };
      default:
        return { ...base, opacity: 0.9 };
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(1rem, 2.5vw, 1.5rem)',
        textAlign: 'center',
        padding: '0 1.5rem',
      }}
    >
      {messages.map((msg, i) =>
        i < visibleCount ? (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={getStyle(msg.style)}
          >
            {msg.text}
          </motion.p>
        ) : null
      )}
    </div>
  );
}
