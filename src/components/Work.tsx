import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import { Star } from 'lucide-react';
import { PROJECTS, type Project } from '../lib/data';
import { Reveal } from '../lib/Reveal';
import SmartImage from './SmartImage';
import { useMediaQuery } from '../lib/useMediaQuery';

/*
 * One project. The glass caption plate overlaps the image on both sizes -
 * that overlap is the card's identity - but on a phone it drops to a 30px
 * bite and spans nearly the full width, because a 76%-wide plate with 28px
 * of padding leaves about 24 characters per line on a 390px screen.
 */
function Panel({ p }: { p: Project }) {
  return (
    <article className="w-[min(74vw,900px)] shrink-0">
      <div className="mb-12 flex items-baseline justify-between gap-12 text-label tracking-label uppercase text-paper/45">
        <span>
          ( {p.index} ) · {p.category}
        </span>
        <span className="shrink-0">{p.year}</span>
      </div>

      <a href={p.url} target="_blank" rel="noreferrer" className="block">
        <SmartImage
          src={p.image}
          alt={`${p.title} screenshot`}
          aspect="aspect-[5/4] md:aspect-[16/10]"
          fit={p.imageFit}
        />
      </a>

      <div className="glass relative z-10 -mt-[30px] mx-[4%] p-[20px] md:-mt-[64px] md:mr-0 md:w-[76%] md:p-[28px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-12 gap-y-8">
          <h3 className="title-lg">{p.title}</h3>
          {p.award && (
            <span className="text-label tracking-label uppercase text-paper/50">
              {/* Filled, because the glyph it replaces was solid - an outline
                  star at 11px reads as a different mark, not the same one */}
              <Star
                aria-hidden
                fill="currentColor"
                strokeWidth={1.5}
                className="mr-[5px] inline-block size-[1em] align-[-0.16em]"
              />
              {p.award}
            </span>
          )}
        </div>
        <p className="mt-12 text-body-sm leading-[1.5] text-paper/65">
          {p.description}
        </p>

        {/* Phone: the stack wraps on its own line and the CTA becomes a
            full-width 46px target. Desktop keeps them on one row with the
            CTA pushed right. */}
        <div className="mt-[18px] flex flex-col gap-[14px] md:mt-28 md:flex-row md:flex-wrap md:items-center md:gap-8">
          <div className="flex flex-wrap items-center gap-8">
            {p.stack.map((s) => (
              <span
                key={s}
                className="pill border border-paper/20 px-[13px] py-[5px] text-caption text-paper/70 md:px-[16px]"
              >
                {s}
              </span>
            ))}
          </div>
          <a
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="pill pill-dark pressable flex h-[46px] w-full items-center justify-center border border-paper/40 text-body-sm md:ml-auto md:h-auto md:w-auto md:px-[28px] md:py-[9px]"
          >
            View live ↗
          </a>
        </div>
      </div>
    </article>
  );
}

/*
 * Desktop: the section pins and vertical scroll drives the gallery sideways
 * - a scrubbed dolly along the work. You control every frame; scroll back
 * and it rewinds.
 */
function WorkHorizontal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState(0);
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      setRange(
        Math.max(trackRef.current.scrollWidth - window.innerWidth, 0),
      );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -range]);
  const index = useTransform(scrollYProgress, [0, 1], [1, PROJECTS.length]);
  useMotionValueEvent(index, 'change', (v) => setCurrent(Math.round(v)));

  return (
    <section
      ref={wrapRef}
      id="work"
      className="relative"
      style={{ height: `${PROJECTS.length * 110}svh` }}
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="flex items-baseline justify-between px-[max(24px,4vw)] text-label tracking-label uppercase text-paper/45">
          <span>( 03 ) - Selected work</span>
          <span className="tabular-nums">
            {String(current).padStart(2, '0')} /{' '}
            {String(PROJECTS.length).padStart(2, '0')}
          </span>
        </div>
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="mt-40 flex w-max gap-[6vw] px-[max(24px,8vw)] will-change-transform"
        >
          {PROJECTS.map((p) => (
            <Panel key={p.title} p={p} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* Mobile and reduced-motion: a calm vertical edit of the same scenes */
function WorkVertical() {
  return (
    <section
      id="work"
      className="mx-auto max-w-[1240px] px-[max(20px,5vw)] md:px-[max(24px,4vw)]"
    >
      <p className="text-label tracking-label uppercase text-paper/45">
        ( 03 ) - Selected work
      </p>
      <div className="mt-40 space-y-[max(72px,10vh)] md:mt-64 md:space-y-[max(120px,14vh)]">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.title} delay={i === 0 ? 0 : 0.05}>
            <div className="w-full [&>article]:w-full">
              <Panel p={p} />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function Work() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduce = useReducedMotion();
  return isDesktop && !reduce ? <WorkHorizontal /> : <WorkVertical />;
}
