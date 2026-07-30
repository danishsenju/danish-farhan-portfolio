import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'motion/react';
import { Asterisk } from 'lucide-react';
import IridescentCanvas from './IridescentCanvas';
import { useMediaQuery } from '../lib/useMediaQuery';

function useKLTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kuala_Lumpur',
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function Letters({
  text,
  startDelay = 0,
}: {
  text: string;
  startDelay?: number;
}) {
  return (
    <>
      {text.split('').map((ch, i) => (
        <span key={i} className="mask-letter">
          <span
            style={{ '--d': `${startDelay + i * 42}ms` } as React.CSSProperties}
          >
            {ch}
          </span>
        </span>
      ))}
    </>
  );
}

const SERVICES = [
  'Frontend Engineering',
  'UI/UX & Interaction',
  'Full-Stack Systems',
  'Motion Design',
];

/* The cutout portrait (transparent PNG) - renders only once the real file
   loads, anchored to the bottom like a studio subject in the frame.
   Desktop stands it in the right third of the composition; portrait crops
   it off the right edge so the text column keeps a clean left margin. */
function HeroCutout({ y }: { y: MotionValue<string> }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.img
      src="/images/portrait.png"
      alt=""
      aria-hidden
      onLoad={() => setLoaded(true)}
      style={{ y, animation: loaded ? 'fade-in 1.4s ease 0.5s both' : undefined }}
      className={`pointer-events-none absolute bottom-0 right-[-14%] z-[6] h-[min(46svh,380px)] w-auto object-contain object-bottom drop-shadow-[0_24px_64px_rgba(0,0,0,0.55)] md:right-[max(0px,6vw)] md:h-[min(74svh,700px)] ${
        loaded ? '' : 'hidden'
      }`}
    />
  );
}

/*
 * Editorial split hero over the liquid.
 *
 * Desktop is a two-column spread: intro line and monumental headline left,
 * a short thesis right, numbered services along the bottom.
 *
 * Portrait re-cuts the same scene for a tall frame - one centred column,
 * the headline and thesis reading as a single vertical run, the portrait
 * cropped off the right edge behind two scrims that protect the type. Both
 * pin and push toward the camera as you scroll; the phone pushes less,
 * because on a small frame a 16% zoom shoves the headline off the edge.
 */
export default function Hero() {
  const time = useKLTime();
  const reduce = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end start'],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 0.9],
    [1, reduce ? 1 : isMobile ? 1.07 : 1.16],
  );
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const cutoutY = useTransform(
    scrollYProgress,
    [0, 0.9],
    ['0%', reduce ? '0%' : isMobile ? '9%' : '14%'],
  );
  const dim = useTransform(scrollYProgress, [0.1, 0.9], [0, 0.92]);

  return (
    <div ref={wrapperRef} className="relative h-[138svh] md:h-[170svh]">
      {/* The 520px floor stops the hero collapsing on a short window - but a
          phone held sideways IS a short window, and there the floor is what
          crops the services rail off the bottom. Above 560px tall only. */}
      <section className="sticky top-0 h-svh overflow-hidden [@media(min-height:560px)]:min-h-[520px]">
        <IridescentCanvas speed={2.2} />
        <HeroCutout y={cutoutY} />

        {/* Portrait-only scrims: one along the bottom so the services rail
            reads over the cutout's feet, one down the left so the headline
            never fights its silhouette. Desktop has room and needs neither. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] h-[36%] bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent md:hidden"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[7] w-[64%] bg-gradient-to-r from-obsidian/70 via-obsidian/28 to-transparent md:hidden"
        />

        <motion.div
          aria-hidden
          className="absolute inset-0 z-[8] bg-obsidian"
          style={{ opacity: dim }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between px-[max(20px,5vw)] pb-[calc(24px+env(safe-area-inset-bottom))] pt-[72px] md:px-[max(24px,4vw)] md:pb-28 md:pt-[90px]">
          <div
            className="flex items-baseline justify-between text-label tracking-label uppercase text-paper/70"
            style={{ animation: 'fade-in 1.2s ease 0.3s both' }}
          >
            <p>
              Kuala Lumpur<span className="hidden sm:inline">, Malaysia</span>
            </p>
            <p>
              <span className="hidden sm:inline">Portfolio © 2026 · </span>
              {time && `KUL ${time}`}
            </p>
          </div>

          {/* Stacked, this gap is the only thing separating two groups, and
              CSS px are not what the eye measures: display-anchor's 0.94
              leading lets the g in "Engineer" hang past its line box and eat
              into the space below it. 34px measured about 36px optically
              against the pair's 30px - close enough that the four lines read
              as four separate things instead of two pairs. 56px is the first
              value where the break is unmistakable. Two columns on lg and it
              becomes a column gap instead. */}
          <motion.div
            className="grid flex-1 content-center items-center gap-[56px] lg:gap-28 lg:grid-cols-[1.35fr_0.65fr]"
            style={{ scale, opacity }}
          >
            <div>
              <p className="mask-line">
                <span
                  className="serif-italic text-subheading text-paper/90"
                  style={{ '--reveal-delay': '100ms' } as React.CSSProperties}
                >
                  Hey, I'm Danish Farhan -
                </span>
              </p>
              {/* 10px let the serif's descenders sit in the headline's
                  cap-height - display-anchor's 0.94 leading pulls "Software"
                  up hard, so the optical gap read as less than the number.
                  20px is still one pair, just no longer a collision. */}
              <h1 className="display-anchor mt-[20px] md:mt-28">
                <span className="block">
                  <Letters text="Software" startDelay={250} />
                </span>
                <span className="block">
                  <Letters text="Engineer" startDelay={600} />
                </span>
              </h1>
            </div>

            <div
              className="max-w-[360px] lg:justify-self-end lg:text-right"
              style={{ animation: 'fade-in 1.2s ease 1.1s both' }}
            >
              {/* text-body is clamp(16px, 1.3vw, 18px), so it only leaves 16px
                  above a 1385px viewport - on every phone this line and the
                  paragraph under it were the same size, separated by weight
                  and opacity alone. That is not enough to make a thesis read
                  as a thesis. A real size step here, and back to the scale on
                  lg where the two columns already do the work. */}
              <p className="text-[19px] font-medium leading-[1.3] text-paper lg:text-body lg:leading-[1.32]">
                Great software should feel invisible.
              </p>
              {/* The thesis is a pair too - 12px keeps it tight enough to read
                  as one thought under the 56px that separates it from the
                  headline above */}
              <p className="mt-12 text-body-sm leading-[1.5] text-paper/60">
                I design and build interfaces where every unseen detail
                compounds - then I disappear behind them.
              </p>
            </div>
          </motion.div>

          <div
            className="grid grid-cols-2 gap-x-[18px] gap-y-[11px] border-t border-paper/15 pt-[18px] md:grid-cols-4 md:gap-x-24 md:gap-y-12 md:pt-20"
            style={{ animation: 'fade-in 1.2s ease 1.3s both' }}
          >
            {SERVICES.map((s, i) => (
              <p
                key={s}
                className="text-label tracking-label uppercase text-paper/60"
              >
                {/* Two narrow columns can't hold "✳ 01 Frontend Engineering"
                    on one line, and a hanging number above a wrapped label
                    reads cleaner than a ragged inline one */}
                <span className="mb-[3px] block text-paper/90 md:mb-0 md:mr-8 md:inline">
                  {/* 1em ties the mark to the label's type scale, so it tracks
                      the clamp instead of drifting at one of the two ends */}
                  <Asterisk
                    aria-hidden
                    strokeWidth={2.5}
                    className="mr-[5px] inline-block size-[1em] align-[-0.16em]"
                  />
                  0{i + 1}
                </span>
                {s}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
