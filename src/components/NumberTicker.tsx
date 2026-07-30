import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/*
 * A number that counts up once, when it arrives on screen.
 *
 * The count is the content here, not decoration - a stat frozen at 0 reads as
 * a claim of zero, not as an animation that hasn't run. So every path out of
 * this component ends on the real value: no observer, throttled frames, an
 * unmount mid-count. The animation is the nice case, never the only case.
 */
export default function NumberTicker({
  value,
  suffix = '',
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let started = false;
    let finished = false;

    // Same -60px hold as Reveal: count when it's properly on screen, not the
    // instant one pixel of it clears the fold
    const onScreen = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight - 60 && r.bottom > 0;
    };

    const start = () => {
      if (started) return;
      started = true;
      stopWatching();

      // The rAF timestamp is its own clock - anchoring to the first frame
      // keeps the curve honest even when iOS throttles the frame rate under
      // Low Power Mode, instead of skipping to the end or stalling at 0
      let t0 = 0;
      const tick = (now: number) => {
        if (!t0) t0 = now;
        const t = Math.min((now - t0) / 1000, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        setDisplay(Math.round(eased * value));
        if (t < 1) frame = requestAnimationFrame(tick);
        else finished = true;
      };
      frame = requestAnimationFrame(tick);
    };

    let observer: IntersectionObserver | null = null;
    const check = () => {
      if (onScreen()) start();
    };

    const stopWatching = () => {
      observer?.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };

    if (onScreen()) {
      start();
    } else {
      if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) start();
          },
          { rootMargin: '-60px 0px' },
        );
        observer.observe(el);
      }
      // Backstop: Lenis drives native scroll, so this still fires on the
      // engines where the observer goes quiet mid-glide
      window.addEventListener('scroll', check, { passive: true });
      window.addEventListener('resize', check);
    }

    return () => {
      stopWatching();
      cancelAnimationFrame(frame);
      if (started && !finished) setDisplay(value);
    };
  }, [value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}
