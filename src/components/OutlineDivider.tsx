import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

/*
 * A giant hollow title that tracks raw page scroll: moves left while you
 * scroll down, reverses right while you scroll up, and holds still the
 * instant you stop. The measured width lives in a ref so the transform
 * always reads the current value (state in the closure went stale).
 */
export default function OutlineDivider({
  text,
  speed = 0.4,
}: {
  text: string;
  speed?: number;
}) {
  const trackRef = useRef<HTMLParagraphElement>(null);
  const widthRef = useRef(0);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  useEffect(() => {
    const measure = () => {
      widthRef.current = trackRef.current?.getBoundingClientRect().width ?? 0;
    };
    measure();
    // Custom web fonts can still be loading at mount, giving a fallback-font
    // (wrong) width; re-measure once the real font is ready.
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [text]);

  const x = useTransform(scrollY, (latest) => {
    const width = widthRef.current;
    if (reduce || width === 0) return '0px';
    const raw = -latest * speed;
    const wrapped = ((raw % width) + width) % width; // normalize to [0, width)
    return `${wrapped - width}px`; // always in [-width, 0] — never runs dry
  });

  return (
    <div
      className="outline-marquee py-[max(40px,7vh)] md:py-[max(64px,9vh)]"
      aria-hidden
    >
      <motion.div className="flex w-max will-change-transform" style={{ x }}>
        <p ref={trackRef} className="outline-type pr-[max(48px,6vw)]">
          {text} — {text} — {text} —
        </p>
        <p className="outline-type pr-[max(48px,6vw)]">
          {text} — {text} — {text} —
        </p>
      </motion.div>
    </div>
  );
}
