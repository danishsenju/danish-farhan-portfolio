import { useRef, useState } from 'react';

type Phase = 'idle' | 'holding' | 'copied';

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
  const [instant, setInstant] = useState(false);
  const holdTimer = useRef<number>(0);
  const resetTimer = useRef<number>(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      /* clipboard unavailable — the mailto pill next to this still works */
    }
    setPhase('copied');
    clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => {
      setPhase('idle');
      setInstant(false);
    }, 1800);
  };

  const startHold = () => {
    if (phase !== 'idle') return;
    setInstant(false);
    setPhase('holding');
    holdTimer.current = window.setTimeout(copy, 900);
  };

  const cancelHold = () => {
    clearTimeout(holdTimer.current);
    setPhase((p) => (p === 'holding' ? 'idle' : p));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (phase === 'idle') {
      setInstant(true);
      void copy();
    }
  };

  return (
    <button
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      className={`pill pressable relative flex h-[48px] w-full select-none items-center justify-center overflow-hidden border border-paper text-body-sm text-paper md:h-auto md:w-auto md:px-[33px] md:py-[11px] ${
        phase !== 'idle' ? 'holding' : ''
      } ${instant ? '[&_.hold-fill]:!transition-none' : ''}`}
      style={{ touchAction: 'none' }}
    >
      <Labels copied={phase === 'copied'} />
      <span
        aria-hidden
        className="hold-fill absolute inset-0 flex items-center justify-center bg-paper text-obsidian"
      >
        <Labels copied={phase === 'copied'} />
      </span>
      <span aria-live="polite" className="sr-only">
        {phase === 'copied' ? 'Email address copied to clipboard' : ''}
      </span>
    </button>
  );
}
