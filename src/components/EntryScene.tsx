import { motion } from 'framer-motion';

interface EntrySceneProps {
  onEnter: () => void;
}

export default function EntryScene({ onEnter }: EntrySceneProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: 'easeInOut' }}
      style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: 'var(--section-padding)',
        textAlign: 'center',
      }}
    >
      {/* Poem */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, delay: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="corner-frame corner-frame-bottom"
        style={{
          maxWidth: '560px',
          marginBottom: '3rem',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            lineHeight: 1.8,
            color: 'var(--cream)',
            letterSpacing: '0.02em',
          }}
        >
          "Do not go gentle into that good night.
          <br />
          <span style={{ opacity: 0.7 }}>Rage, rage against the dying of the light."</span>
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.6rem, 1.2vw, 0.7rem)',
            color: 'var(--gold-dim)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: '1.25rem',
          }}
        >
          — Dylan Thomas
        </p>
      </motion.div>

      {/* Enter Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <button
          id="enter-tesseract"
          className="btn-primary"
          onClick={onEnter}
        >
          <span style={{ fontSize: '0.75rem' }}>◈</span>
          Enter the Tesseract
          <span style={{ fontSize: '0.75rem' }}>◈</span>
        </button>
      </motion.div>

      {/* Subtle tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 2, delay: 4.5 }}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.55rem, 1vw, 0.65rem)',
          color: 'var(--cream-dim)',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          marginTop: '3rem',
        }}
      >
        A message across time and space
      </motion.p>
    </motion.section>
  );
}
