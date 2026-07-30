import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'motion/react';

const TEXT =
  'I believe software should feel made by hand. I design in the browser, sweat the easing curves, and ship interfaces where every unseen detail compounds — until the whole thing simply feels right.';

const WORDS = TEXT.split(' ');
const TOTAL_CHARS = TEXT.length;

/* One character: gray until the scroll reaches it, then white — monopo.vn's
   letter-by-letter ink, scrubbed and reversible. */
function Char({
  ch,
  index,
  progress,
}: {
  ch: string;
  index: number;
  progress: MotionValue<number>;
}) {
  // All characters finish by 78% of the pin, leaving a beat of stillness
  const start = (index / TOTAL_CHARS) * 0.78;
  const end = start + (1 / TOTAL_CHARS) * 0.78 + 0.015;
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  return <motion.span style={{ opacity }}>{ch}</motion.span>;
}

export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  if (reduce) {
    return (
      <section className="relative z-10 mx-auto max-w-[1240px] px-[max(20px,5vw)] py-[max(80px,12vh)] md:px-[max(24px,4vw)] md:py-[max(120px,16vh)]">
        <p className="text-label tracking-label uppercase text-paper/45">
          ( 02 ) — Manifesto
        </p>
        <p className="whisper mt-40 max-w-[1050px] text-paper md:mt-64">
          {TEXT}
        </p>
      </section>
    );
  }

  // Words wrap as units; characters ink individually inside them.
  // The pin is 190svh on a phone rather than 260 — the same sentence is a
  // third of the width and twice as many lines there, so the full-height
  // track would read as the page being stuck rather than as a reveal.
  let charIndex = 0;
  const words = WORDS.map((word, wi) => {
    const chars = word.split('').map((ch) => {
      const node = (
        <Char key={charIndex} ch={ch} index={charIndex} progress={scrollYProgress} />
      );
      charIndex++;
      return node;
    });
    charIndex++; // the space after the word
    return (
      <span key={wi} className="inline-block whitespace-pre">
        {chars}
        {wi < WORDS.length - 1 ? ' ' : ''}
      </span>
    );
  });

  return (
    <section ref={ref} className="relative z-10 h-[190svh] md:h-[260svh]">
      <div className="sticky top-0 flex h-svh items-center">
        <div className="mx-auto w-full max-w-[1240px] px-[max(20px,5vw)] md:px-[max(24px,4vw)]">
          <p className="text-label tracking-label uppercase text-paper/45">
            ( 02 ) — Manifesto
          </p>
          <p className="whisper mt-40 max-w-[1050px] text-paper md:mt-64">
            {words}
          </p>
        </div>
      </div>
    </section>
  );
}
