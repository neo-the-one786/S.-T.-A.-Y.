import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Starfield from './components/Starfield';
import DustMotes from './components/DustMotes';
import LightLeaks from './components/LightLeaks';
import EntryScene from './components/EntryScene';
import MorseTransmission from './components/MorseTransmission';
import WormholeFlash from './components/WormholeFlash';
import MessageReveal from './components/MessageReveal';
import TimeCounter from './components/TimeCounter';

type Act = 'entry' | 'transmission' | 'reveal';

/* ─── Audio helpers ─── */
function fadeIn(audio: HTMLAudioElement, targetVol: number, durationMs = 2000) {
  audio.volume = 0;
  audio.play().catch(() => {});
  const steps = 40;
  const stepMs = durationMs / steps;
  let step = 0;
  const interval = setInterval(() => {
    step++;
    audio.volume = Math.min(targetVol, (step / steps) * targetVol);
    if (step >= steps) clearInterval(interval);
  }, stepMs);
  return interval;
}

function fadeOut(audio: HTMLAudioElement, durationMs = 1500): Promise<void> {
  return new Promise((resolve) => {
    const startVol = audio.volume;
    if (startVol <= 0) { audio.pause(); resolve(); return; }
    const steps = 30;
    const stepMs = durationMs / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(interval);
        audio.pause();
        audio.volume = 0;
        resolve();
      }
    }, stepMs);
  });
}

export default function App() {
  const [act, setAct] = useState<Act>('entry');
  const [flashTrigger, setFlashTrigger] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showFinalScene, setShowFinalScene] = useState(false);

  // Three audio tracks
  const track1Ref = useRef<HTMLAudioElement | null>(null); // stay1: Act 1
  const track2Ref = useRef<HTMLAudioElement | null>(null); // stay2: Act 2 (morse)
  const track3Ref = useRef<HTMLAudioElement | null>(null); // stay3: Act 2 decode → Act 3
  const activeTrackRef = useRef<HTMLAudioElement | null>(null);
  const tracksLoaded = useRef({ t1: false, t2: false, t3: false });

  // Initialize all three audio tracks
  useEffect(() => {
    const t1 = new Audio('/stay1.mp3');
    const t2 = new Audio('/stay2.mp3');
    const t3 = new Audio('/stay3.mp3');

    t1.loop = true;
    t2.loop = true;
    t3.loop = true;
    t1.preload = 'auto';
    t2.preload = 'auto';
    t3.preload = 'auto';
    t1.volume = 0;
    t2.volume = 0;
    t3.volume = 0;

    t1.addEventListener('canplaythrough', () => { tracksLoaded.current.t1 = true; });
    t2.addEventListener('canplaythrough', () => { tracksLoaded.current.t2 = true; });
    t3.addEventListener('canplaythrough', () => { tracksLoaded.current.t3 = true; });

    // Graceful fallback for missing files
    t1.addEventListener('error', () => { tracksLoaded.current.t1 = false; });
    t2.addEventListener('error', () => { tracksLoaded.current.t2 = false; });
    t3.addEventListener('error', () => { tracksLoaded.current.t3 = false; });

    track1Ref.current = t1;
    track2Ref.current = t2;
    track3Ref.current = t3;

    return () => {
      [t1, t2, t3].forEach((t) => { t.pause(); t.src = ''; });
    };
  }, []);

  // Switch track: fade out current, fade in next
  const switchTrack = useCallback(async (next: HTMLAudioElement | null, targetVol = 0.55) => {
    const current = activeTrackRef.current;
    if (current && current !== next) {
      await fadeOut(current, 1200);
    }
    if (next) {
      activeTrackRef.current = next;
      fadeIn(next, targetVol, 2000);
      setMusicPlaying(true);
    }
  }, []);

  // Toggle current music
  const toggleMusic = useCallback(() => {
    const current = activeTrackRef.current;
    if (!current) return;

    if (musicPlaying) {
      current.pause();
      setMusicPlaying(false);
    } else {
      current.play().then(() => {
        current.volume = 0.55;
        setMusicPlaying(true);
      }).catch(() => {});
    }
  }, [musicPlaying]);

  // ─── Act 1 → Enter clicked ───
  const handleEnter = useCallback(() => {
    // Start track 1 on this user gesture (satisfies autoplay policy)
    // Then immediately crossfade to track 2 for Act 2
    const t1 = track1Ref.current;
    const t2 = track2Ref.current;

    if (t1 && tracksLoaded.current.t1) {
      // Start track1 briefly so browser allows audio
      t1.volume = 0;
      t1.play().catch(() => {});
      activeTrackRef.current = t1;
      setMusicPlaying(true);

      // Crossfade to track 2 after a beat
      setTimeout(async () => {
        if (t2 && tracksLoaded.current.t2) {
          await switchTrack(t2, 0.55);
        }
      }, 500);
    } else if (t2 && tracksLoaded.current.t2) {
      // No track1, start track2 directly
      switchTrack(t2, 0.55);
    }

    setAct('transmission');
  }, [switchTrack]);

  // ─── Decode button clicked → switch to track 3 ───
  const handleDecodeClick = useCallback(() => {
    const t3 = track3Ref.current;
    if (t3 && tracksLoaded.current.t3) {
      switchTrack(t3, 0.55);
    }
  }, [switchTrack]);

  // ─── STAY translation complete → flash → Act 3 ───
  const handleTranslated = useCallback(() => {
    setFlashTrigger(true);
  }, []);

  const handleFlashComplete = useCallback(() => {
    setFlashTrigger(false);
    setAct('reveal');
  }, []);

  // Show final scene after message unfolds
  useEffect(() => {
    if (act === 'reveal') {
      const timer = setTimeout(() => setShowFinalScene(true), 12000);
      return () => clearTimeout(timer);
    }
  }, [act]);

  return (
    <div className="film-grain" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background layers */}
      <Starfield />
      <DustMotes />
      <LightLeaks />

      {/* Wormhole flash */}
      <WormholeFlash trigger={flashTrigger} onComplete={handleFlashComplete} />

      {/* Music toggle — visible after Act 1 */}
      {act !== 'entry' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className={`music-toggle ${musicPlaying ? 'playing' : ''}`}
          onClick={toggleMusic}
          aria-label={musicPlaying ? 'Pause music' : 'Play music'}
        >
          {musicPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
              <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </motion.button>
      )}

      {/* Acts */}
      <AnimatePresence mode="wait">
        {act === 'entry' && (
          <motion.div
            key="entry"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <EntryScene onEnter={handleEnter} />
          </motion.div>
        )}

        {act === 'transmission' && (
          <motion.div
            key="transmission"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <MorseTransmission
              onTranslated={handleTranslated}
              onDecodeClick={handleDecodeClick}
            />
          </motion.div>
        )}

        {act === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.3 }}
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: '100dvh',
              padding: 'var(--section-padding)',
              paddingTop: 'clamp(3rem, 10vh, 8rem)',
            }}
          >
            {/* STAY title */}
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <div className="wormhole-ring" />
              <motion.h1
                initial={{ scale: 0.85, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(4rem, 12vw, 9rem)',
                  fontWeight: 700,
                  letterSpacing: '0.3em',
                  background: 'linear-gradient(180deg, var(--gold-bright) 0%, var(--gold) 50%, var(--gold-dim) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 40px rgba(201,168,76,0.25))',
                  lineHeight: 1,
                  position: 'relative',
                  zIndex: 1,
                  textAlign: 'center',
                }}
              >
                S T A Y
              </motion.h1>
            </div>

            {/* Dr. Brand quote */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 1.5, duration: 1.5 }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
                fontStyle: 'italic',
                color: 'var(--cream)',
                textAlign: 'center',
                maxWidth: '460px',
                lineHeight: 1.7,
                marginBottom: '0.5rem',
              }}
            >
              "Love is the one thing that transcends time and space."
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 2, duration: 1 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.5rem, 0.9vw, 0.6rem)',
                color: 'var(--cream-dim)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              — Dr. Brand
            </motion.p>

            {/* Ornamental divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 1 }}
              className="ornament-divider"
            >
              <span className="line" />
              <span className="star">✦</span>
              <span className="line" />
            </motion.div>

            {/* Emotional message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
            >
              <MessageReveal />
            </motion.div>

            {/* Time counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 10, duration: 2 }}
            >
              <div className="ornament-divider" style={{ marginTop: '2.5rem' }}>
                <span className="line" />
                <span className="star">✦</span>
                <span className="line" />
              </div>
              <TimeCounter
                since="2026-04-14T20:00:00+05:30"
                label="Time since we last stood together"
              />
            </motion.div>

            {/* Final scene */}
            <AnimatePresence>
              {showFinalScene && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ marginTop: '3rem', textAlign: 'center' }}
                >
                  <div className="ornament-divider">
                    <span className="line" />
                    <span className="star">✦</span>
                    <span className="line" />
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                      fontStyle: 'italic',
                      fontWeight: 300,
                      color: 'var(--cream)',
                      lineHeight: 1.8,
                      maxWidth: '480px',
                      margin: '0 auto',
                      opacity: 0.85,
                    }}
                  >
                    No matter how far…
                    <br />
                    we are under the same sky.
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(0.5rem, 0.9vw, 0.6rem)',
                      color: 'var(--gold-dim)',
                      letterSpacing: '0.4em',
                      textTransform: 'uppercase',
                      marginTop: '2rem',
                      opacity: 0.5,
                    }}
                  >
                    ∞
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
