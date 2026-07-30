import { useRef } from 'react';
import { motion, useScroll, useReducedMotion } from 'motion/react';
import { ROLES, type Role } from '../lib/data';
import { Reveal } from '../lib/Reveal';

/*
 * Each row's hairline draws itself left-to-right as the row crosses the
 * viewport - scrubbed to scroll, so easing back erases it again.
 */
function Row({ r, first }: { r: Role; first: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.95', 'start 0.55'],
  });

  return (
    <div ref={ref}>
      {!first && (
        <motion.div
          aria-hidden
          className="h-px w-full origin-left bg-paper/15"
          style={{ scaleX: reduce ? 1 : scrollYProgress }}
        />
      )}
      <Reveal>
        <div className="grid gap-8 py-40 md:gap-12 md:grid-cols-[220px_1fr]">
          {/* Stacked, the dates need to read as a heading kicker rather than
              a stray caption above the role */}
          <span className="text-label tracking-label uppercase text-paper/45 md:text-caption md:tracking-normal md:normal-case">
            {r.period}
          </span>
          <div>
            <h3 className="text-body-sm font-normal leading-[1.35] text-paper">
              {r.role}
              <span className="block text-paper/50 md:inline">
                <span className="hidden md:inline"> · </span>
                {r.company}
              </span>
            </h3>
            <p className="mt-8 text-caption text-paper/35">
              {r.place}, Malaysia
            </p>
            {/* The row divider above is already a hairline, so a hairline
                bullet had nothing to distinguish it. Hanging numbers speak
                the counting language the rest of the page uses - ( 04 )
                Experience, 01-04 on the services rail - and let the copy
                keep one clean left edge. items-baseline does the alignment,
                so the number sits on the first line's baseline without a
                magic pixel nudge. */}
            <ul className="mt-12 max-w-[640px] space-y-[10px] text-body-sm leading-[1.5] text-paper/65">
              {r.points.map((pt, i) => (
                <li key={pt} className="flex items-baseline gap-12">
                  <span
                    aria-hidden
                    className="w-[17px] shrink-0 text-label tracking-label tabular-nums text-paper/30"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default function Experience() {
  return (
    <section className="mx-auto max-w-[1240px] px-[max(20px,5vw)] pt-[max(80px,12vh)] md:px-[max(24px,4vw)] md:pt-[max(120px,16vh)]">
      <Reveal>
        <p className="text-label tracking-label uppercase text-paper/45">
          ( 04 ) - Experience
        </p>
      </Reveal>

      <div className="mt-40 md:mt-64">
        {ROLES.map((r, i) => (
          <Row key={r.company} r={r} first={i === 0} />
        ))}
      </div>

      <Reveal>
        <div className="glass mt-40 grid gap-[28px] p-[22px] md:mt-0 md:gap-40 md:p-[34px] md:grid-cols-2">
          <div>
            <p className="text-label tracking-label uppercase text-paper/45">
              Education
            </p>
            <p className="mt-12 text-body-sm text-paper">
              BIT (Hons.) Software Engineering
            </p>
            <p className="mt-8 text-caption text-paper/50">
              Universiti Kuala Lumpur · 2022–2025 · Dean's List
            </p>
            <p className="mt-28 text-body-sm text-paper">
              Diploma in Computer Science
            </p>
            <p className="mt-8 text-caption text-paper/50">
              Universiti Poly-Tech Malaysia · 2019–2021 · CGPA 3.46 · Dean's
              List ×2
            </p>
          </div>
          <div>
            <p className="text-label tracking-label uppercase text-paper/45">
              Certifications
            </p>
            <p className="mt-12 text-body-sm text-paper">
              CCNA: Introduction to Networks
            </p>
            <p className="mt-8 text-caption text-paper/50">
              Cisco Networking Academy · 2025
            </p>
            <p className="mt-28 text-label tracking-label uppercase text-paper/45">
              Languages
            </p>
            <p className="mt-12 text-body-sm text-paper">
              Bahasa Malaysia · English
            </p>
            <p className="mt-8 text-caption text-paper/50">
              Native · Professional
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
