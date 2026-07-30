import { useEffect, useId, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';

type Phase = 'idle' | 'holding' | 'copied';

const HOLD_SECONDS = 0.9;

/*
 * The surface, in objectBoundingBox space - 0..1 on both axes, so the shape
 * scales itself to a full-width phone button and a padded desktop one
 * without measuring either.
 *
 * Two waves, not one: a single sine is a machine part. Two at different
 * wavelengths, drifting in opposite directions, never repeat the same
 * profile and read as water. Amplitude falls to nothing as the glass fills,
 * because a surface with no room left above it has nothing to slosh into.
 */
function liquidPath(level: number, drift: number, still: boolean) {
  const surface = 1 - level;
  if (still) return `M0,${surface} L1,${surface} L1,1 L0,1 Z`;

  const amp = 0.075 * (1 - level * level);
  const steps = 36;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    const y =
      surface +
      amp * Math.sin((x * 2.2 + drift) * Math.PI * 2) +
      amp * 0.55 * Math.sin((x * 3.7 - drift * 1.6) * Math.PI * 2);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(4)},${y.toFixed(4)} `;
  }
  return `${d}L1,1 L0,1 Z`;
}

function Labels({ copied }: { copied: boolean }) {
  return (
    <span className="relative block whitespace-nowrap">
      <span className={`hold-label block ${copied ? 'swapping' : ''}`}>
        Hold to copy email
      </span>
      <span
        className={`hold-label absolute inset-0 ${copied ? '' : 'swapping'}`}
      >
        Email copied ✓
      </span>
    </span>
  );
}

export default function HoldToCopy({ email }: { email: string }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const reduce = useReducedMotion();

  // useId's delimiters are not valid in a url(#...) reference
  const clipId = `liquid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const pathRef = useRef<SVGPathElement>(null);
  const level = useRef({ v: 0, drift: 0 });
  const levelTween = useRef<gsap.core.Tween | null>(null);
  const waveTween = useRef<gsap.core.Tween | null>(null);
  const resetTimer = useRef(0);

  /* Pointer-up can arrive in the same frame as pointer-down on a fast tap,
     before React has committed the state change - a guard reading `phase`
     from the render closure would still see 'idle', skip the cancel, and let
     a tap copy what only a hold should. The ref is current immediately. */
  const phaseRef = useRef<Phase>('idle');
  const to = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  /* Decoded and ready before the first press, because a sound that arrives
     even a few frames after the surface lands is worse than no sound - the
     two stop reading as one event and start reading as an echo. */
  const pop = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const a = new Audio('/sound/pop-sound-effect.mp3');
    a.preload = 'auto';
    a.volume = 0.35;
    pop.current = a;
    return () => {
      a.pause();
      pop.current = null;
    };
  }, []);

  const playPop = () => {
    const a = pop.current;
    if (!a) return;
    // Rewound, so a second copy inside the same second still sounds
    a.currentTime = 0;
    // Blocked autoplay or a missing codec must never break the copy it
    // was only ever decorating
    void a.play().catch(() => {});
  };

  useEffect(() => {
    const still = !!reduce;
    const render = () =>
      pathRef.current?.setAttribute(
        'd',
        liquidPath(level.current.v, level.current.drift, still),
      );
    render();

    if (still) return;

    // Parked until a press needs it - an idle button has no business
    // holding the ticker open
    waveTween.current = gsap.to(level.current, {
      drift: '+=1',
      duration: 1.9,
      ease: 'none',
      repeat: -1,
      paused: true,
      onUpdate: render,
    });

    return () => {
      waveTween.current?.kill();
      waveTween.current = null;
    };
  }, [reduce]);

  const render = () =>
    pathRef.current?.setAttribute(
      'd',
      liquidPath(level.current.v, level.current.drift, !!reduce),
    );

  const drain = () => {
    levelTween.current?.kill();
    waveTween.current?.play();
    // Slow while they are deciding, fast when the system answers
    levelTween.current = gsap.to(level.current, {
      v: 0,
      duration: 0.26,
      ease: 'power3.out',
      onUpdate: render,
      onComplete: () => waveTween.current?.pause(),
    });
  };

  const copy = async () => {
    /* First, and deliberately before the await: this runs in the same tick as
       the tween that just filled the glass, so the pop lands on the frame the
       surface reaches the top. Moving it below the clipboard call would tie
       it to an async round trip instead of to the thing the user watched. */
    playPop();

    try {
      await navigator.clipboard.writeText(email);
    } catch {
      /* clipboard unavailable - the mailto pill next to this still works */
    }
    to('copied');
    // A full glass has no room above the surface, so amplitude is already
    // zero here - parking the ticker costs the animation nothing
    waveTween.current?.pause();
    clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => {
      to('idle');
      drain();
    }, 1800);
  };

  const startHold = () => {
    if (phaseRef.current !== 'idle') return;
    to('holding');
    waveTween.current?.play();
    levelTween.current?.kill();
    levelTween.current = gsap.to(level.current, {
      v: 1,
      duration: HOLD_SECONDS,
      ease: 'none',
      onUpdate: render,
      onComplete: () => void copy(),
    });
  };

  const cancelHold = () => {
    if (phaseRef.current !== 'holding') return;
    to('idle');
    drain();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (phaseRef.current !== 'idle') return;
    // A keyboard press is a single event, not a duration - there is no hold
    // to visualise, so the glass is simply full
    levelTween.current?.kill();
    level.current.v = 1;
    render();
    void copy();
  };

  useEffect(
    () => () => {
      clearTimeout(resetTimer.current);
      levelTween.current?.kill();
    },
    [],
  );

  return (
    <button
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      className="pill pressable relative flex h-[48px] w-full select-none items-center justify-center overflow-hidden border border-paper text-body-sm text-paper md:h-auto md:w-auto md:px-[33px] md:py-[11px]"
      style={{ touchAction: 'none' }}
    >
      <Labels copied={phase === 'copied'} />

      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <clipPath id={clipId} clipPathUnits="objectBoundingBox">
          <path ref={pathRef} d="M0,1 L1,1 L1,1 L0,1 Z" />
        </clipPath>
      </svg>

      <span
        aria-hidden
        className="hold-fill absolute inset-0 flex items-center justify-center bg-paper text-obsidian"
        style={{ clipPath: `url(#${clipId})` }}
      >
        <Labels copied={phase === 'copied'} />
      </span>

      <span aria-live="polite" className="sr-only">
        {phase === 'copied' ? 'Email address copied to clipboard' : ''}
      </span>
    </button>
  );
}
