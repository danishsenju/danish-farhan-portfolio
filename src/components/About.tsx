import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { CAPABILITIES } from '../lib/data';
import { Reveal } from '../lib/Reveal';
import { useMediaQuery } from '../lib/useMediaQuery';
import NumberTicker from './NumberTicker';
import SmartImage from './SmartImage';

const STATS = [
  { value: 4, suffix: '×', label: 'hackathon 1st places' },
  { value: 4, suffix: '', label: 'apps in production' },
  { value: 2, suffix: '', label: 'live government systems' },
];

/*
 * Two columns riding the scroll at different speeds — the portrait drifts up
 * slower than the text, so the section has depth the whole way through, not
 * just at the moment it enters.
 *
 * Stacked into one column that counter-drift stops being depth and starts
 * being a gap opening and closing between the image and the paragraph under
 * it, so the phone keeps a gentle single drift and drops the opposition.
 */
export default function About() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const still = reduce || isMobile;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const portraitY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : isMobile ? [26, -26] : [70, -70],
  );
  const textY = useTransform(
    scrollYProgress,
    [0, 1],
    still ? [0, 0] : [-24, 24],
  );

  return (
    <section
      ref={ref}
      id="about"
      className="mx-auto max-w-[1240px] px-[max(20px,5vw)] md:px-[max(24px,4vw)]"
    >
      <Reveal>
        <p className="mb-40 text-label tracking-label uppercase text-paper/45 md:mb-64">
          ( 01 ) — About
        </p>
      </Reveal>
      <div className="grid gap-40 md:gap-64 md:grid-cols-[0.85fr_1.15fr]">
        <motion.div style={{ y: portraitY }} className="will-change-transform">
          {/* A 4:5 portrait fills two thirds of a phone screen — 3:4 keeps
              it a picture rather than a wall */}
          <SmartImage
            src="/images/portrait.jpeg"
            alt="Studio portrait"
            aspect="aspect-[3/4] md:aspect-[4/5]"
          />
        </motion.div>

        <motion.div style={{ y: textY }} className="will-change-transform">
          <Reveal>
            <p className="text-reading font-light text-paper/85">
              I'm Danish Farhan — a full-stack software engineer from Kuala
              Lumpur. I've shipped real-time transit tracking, payment flows,
              and certificate systems running inside Malaysian maritime
              operations — and taken first place at all four hackathons I've
              entered. I care about{' '}
              <span className="serif-italic">the last 4%</span> most
              people skip: the easing curve, the empty state, the way a button
              answers your press.
            </p>
          </Reveal>

          {/* Three columns of stats on a phone gives each label ~110px and
              breaks "hackathon 1st places" over three lines. Stacked, each
              stat reads as one line: number left, what it counts right. */}
          <Reveal delay={0.1}>
            <dl className="mt-64 grid border-t border-paper/12 pt-40 sm:grid-cols-3 sm:gap-28">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="flex items-baseline justify-between gap-12 border-b border-paper/8 py-[14px] first:pt-0 last:border-0 last:pb-0 sm:block sm:border-0 sm:py-0"
                >
                  <dd className="text-subheading font-normal leading-none text-paper">
                    <NumberTicker value={s.value} suffix={s.suffix} />
                  </dd>
                  <dt className="text-right text-caption text-paper/45 sm:mt-8 sm:text-left">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-64 grid gap-[26px] border-t border-paper/12 pt-40 sm:grid-cols-3 sm:gap-40">
              {CAPABILITIES.map((cap) => (
                <div key={cap.label}>
                  <h3 className="text-label tracking-label uppercase text-paper/45">
                    {cap.label}
                  </h3>
                  <ul className="mt-12 space-y-8 text-body-sm leading-[1.4] text-paper/75">
                    {cap.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}
