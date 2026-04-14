/* eslint-disable react-hooks/purity */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MorseTransmissionProps {
  onTranslated: () => void;
  onDecodeClick?: () => void;
}

/* ─── Beep via Web Audio ─── */
function playBeep(type: 'dot' | 'dash') {
  try {
    const ctx = new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext as typeof AudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'dot' ? 680 : 520;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (type === 'dot' ? 0.12 : 0.25));
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (type === 'dot' ? 0.12 : 0.25));
  } catch {
    // silent fallback
  }
}

/* ─── Glitch character pools ─── */
const MORSE_GLITCH = '._-/|\\*#~+=<>';
const LETTER_GLITCH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$@&';

function pickGlitch(pool: string) {
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ─── Morse groups and their translations ─── */
const GROUPS = [
  { morse: '...', letter: 'S' },
  { morse: '-', letter: 'T' },
  { morse: '.-', letter: 'A' },
  { morse: '-.--', letter: 'Y' },
];

/* ═══════════════════════════════════════════
   Phase 1: Type morse one char at a time with flicker
   ═══════════════════════════════════════════ */
function MorseTyper({ onComplete }: { onComplete: () => void }) {
  const fullString = GROUPS.map((g) => g.morse).join(' ');
  const [chars, setChars] = useState<{ display: string; stable: boolean }[]>([]);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const textChars = fullString.split('');
    let charIndex = 0;

    function typeNext() {
      if (cancelled || charIndex >= textChars.length) {
        if (!cancelled) {
          setCursorVisible(false);
          setTimeout(() => onComplete(), 400);
        }
        return;
      }

      const targetChar = textChars[charIndex];
      const currentIndex = charIndex;
      charIndex++;

      // Spaces: add immediately
      if (targetChar === ' ') {
        setChars((prev) => [...prev, { display: ' ', stable: true }]);
        setTimeout(() => typeNext(), 60);
        return;
      }

      // Play beep
      if (targetChar === '.') playBeep('dot');
      else if (targetChar === '-') playBeep('dash');

      // Start flickering
      let flickerCount = 0;
      const totalFlickers = 4 + Math.floor(Math.random() * 3);

      setChars((prev) => [...prev, { display: pickGlitch(MORSE_GLITCH), stable: false }]);

      const flickerInterval = setInterval(() => {
        if (cancelled) { clearInterval(flickerInterval); return; }
        flickerCount++;

        if (flickerCount >= totalFlickers) {
          clearInterval(flickerInterval);
          setChars((prev) => {
            const next = [...prev];
            if (next[currentIndex]) next[currentIndex] = { display: targetChar, stable: true };
            return next;
          });
          setTimeout(() => typeNext(), 90);
        } else {
          setChars((prev) => {
            const next = [...prev];
            if (next[currentIndex]) next[currentIndex] = { display: pickGlitch(MORSE_GLITCH), stable: false };
            return next;
          });
        }
      }, 50);
    }

    const startTimeout = setTimeout(() => typeNext(), 400);
    return () => { cancelled = true; clearTimeout(startTimeout); };
  }, [fullString, onComplete]);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {chars.map((c, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            minWidth: c.display === ' ' ? '0.5em' : undefined,
            textAlign: 'center',
            color: c.stable ? 'var(--gold)' : 'var(--gold-bright)',
            textShadow: c.stable ? 'none' : '0 0 10px rgba(201,168,76,0.7)',
            transition: 'color 0.15s, text-shadow 0.2s',
          }}
        >
          {c.display}
        </span>
      ))}
      {cursorVisible && (
        <span
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1.1em',
            background: 'var(--gold-bright)',
            marginLeft: '3px',
            verticalAlign: 'text-bottom',
            animation: 'cursor-blink 0.8s step-end infinite',
          }}
        />
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════
   Phase 3: In-place group-by-group translation
   Each morse group flickers and resolves to its letter
   ═══════════════════════════════════════════ */
function InPlaceTranslator({ onComplete }: { onComplete: () => void }) {
  type GroupState = { display: string; state: 'morse' | 'flickering' | 'letter' };
  const [groups, setGroups] = useState<GroupState[]>(
    GROUPS.map((g) => ({ display: g.morse, state: 'morse' }))
  );

  useEffect(() => {
    let cancelled = false;
    let groupIndex = 0;

    function translateNext() {
      if (cancelled || groupIndex >= GROUPS.length) {
        if (!cancelled) setTimeout(() => onComplete(), 500);
        return;
      }

      const gi = groupIndex;
      const targetLetter = GROUPS[gi].letter;
      groupIndex++;

      // Start flickering this group
      let flickerCount = 0;
      const totalFlickers = 8 + Math.floor(Math.random() * 4); // 8–11 flickers

      setGroups((prev) => {
        const next = [...prev];
        next[gi] = { display: pickGlitch(LETTER_GLITCH), state: 'flickering' };
        return next;
      });

      const flickerInterval = setInterval(() => {
        if (cancelled) { clearInterval(flickerInterval); return; }
        flickerCount++;

        if (flickerCount >= totalFlickers) {
          // Resolve to the letter
          clearInterval(flickerInterval);
          setGroups((prev) => {
            const next = [...prev];
            next[gi] = { display: targetLetter, state: 'letter' };
            return next;
          });
          // Pause, then translate next
          setTimeout(() => translateNext(), 350);
        } else {
          setGroups((prev) => {
            const next = [...prev];
            next[gi] = { display: pickGlitch(LETTER_GLITCH), state: 'flickering' };
            return next;
          });
        }
      }, 55);
    }

    const startTimeout = setTimeout(() => translateNext(), 300);
    return () => { cancelled = true; clearTimeout(startTimeout); };
  }, [onComplete]);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.15em' }}>
      {groups.map((g, i) => {
        const isLetter = g.state === 'letter';
        const isFlickering = g.state === 'flickering';

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              textAlign: 'center',
              minWidth: isLetter || isFlickering ? '0.8em' : undefined,
              fontFamily: 'var(--font-mono)',
              fontWeight: isLetter ? 700 : 400,
              fontSize: isLetter ? '1.6em' : '1em',
              color: isFlickering
                ? 'var(--gold-bright)'
                : isLetter
                  ? 'var(--gold)'
                  : 'var(--gold)',
              textShadow: isFlickering
                ? '0 0 12px rgba(201,168,76,0.8)'
                : isLetter
                  ? '0 0 20px rgba(201,168,76,0.25)'
                  : 'none',
              transition: 'all 0.2s ease',
              ...(isLetter
                ? {
                    background: 'linear-gradient(180deg, var(--gold-bright) 0%, var(--gold) 50%, var(--gold-dim) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 15px rgba(201,168,76,0.3))',
                  }
                : {}),
            }}
          >
            {g.display}
          </span>
        );
      })}
    </span>
  );
}

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */

type Phase = 'typing' | 'typed' | 'translating' | 'translated';

export default function MorseTransmission({ onTranslated, onDecodeClick }: MorseTransmissionProps) {
  const [phase, setPhase] = useState<Phase>('typing');

  const handleMorseComplete = useCallback(() => {
    setPhase('typed');
  }, []);

  const handleTranslate = useCallback(() => {
    setPhase('translating');
    onDecodeClick?.();
  }, [onDecodeClick]);

  const handleTranslateComplete = useCallback(() => {
    setPhase('translated');
    setTimeout(() => onTranslated(), 2000);
  }, [onTranslated]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
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
      {/* Transmission header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="signal-bars">
          {[6, 9, 12, 15, 18].map((h, i) => (
            <div key={i} className="signal-bar" style={{ height: h, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.55rem, 1.2vw, 0.7rem)',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--gold-dim)',
          }}
        >
          Incoming Transmission
        </span>
        <div className="signal-bars">
          {[18, 15, 12, 9, 6].map((h, i) => (
            <div key={i} className="signal-bar" style={{ height: h, animationDelay: `${i * 0.2 + 0.5}s` }} />
          ))}
        </div>
      </motion.div>

      {/* ─── Central text area: in-place morse → letters ─── */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)',
          letterSpacing: '0.2em',
          color: 'var(--gold)',
          minHeight: '5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Typing phase: one char at a time with flicker */}
        {phase === 'typing' && (
          <MorseTyper onComplete={handleMorseComplete} />
        )}

        {/* Typed phase: stable morse */}
        {phase === 'typed' && (
          <motion.span initial={{ opacity: 1 }}>
            {GROUPS.map((g) => g.morse).join(' ')}
          </motion.span>
        )}

        {/* Translating phase: groups morph in-place one by one */}
        {phase === 'translating' && (
          <InPlaceTranslator onComplete={handleTranslateComplete} />
        )}

        {/* Translated phase: stable STAY */}
        {phase === 'translated' && (
          <motion.span
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 'clamp(3rem, 9vw, 6rem)',
              letterSpacing: '0.35em',
              background: 'linear-gradient(180deg, var(--gold-bright) 0%, var(--gold) 50%, var(--gold-dim) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(201,168,76,0.3))',
            }}
          >
            S T A Y
          </motion.span>
        )}
      </div>

      {/* ─── Decode button ─── */}
      <AnimatePresence>
        {phase === 'typed' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <button
              id="decode-transmission"
              className="btn-primary"
              onClick={handleTranslate}
            >
              ◈ Decode Transmission ◈
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Decoding indicator ─── */}
      <AnimatePresence>
        {phase === 'translating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(0.55rem, 1vw, 0.7rem)',
              letterSpacing: '0.3em',
              color: 'var(--gold-dim)',
              textTransform: 'uppercase',
              animation: 'pulse-soft 1.5s ease-in-out infinite',
            }}
          >
            Decoding signal...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Frequency label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 2, duration: 2 }}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.5rem, 0.9vw, 0.6rem)',
          color: 'var(--cream-dim)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginTop: '3rem',
          position: 'absolute',
          bottom: 'clamp(1.5rem, 4vw, 3rem)',
        }}
      >
        Frequency: 7.83 Hz — Schumann Resonance
      </motion.p>
    </motion.section>
  );
}
