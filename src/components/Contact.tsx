import BusinessCard3D from './BusinessCard3D';
import HoldToCopy from './HoldToCopy';
import IridescentCanvas from './IridescentCanvas';
import { Reveal } from '../lib/Reveal';
import { scrollToTop } from '../lib/scroll';
import { EMAIL, GITHUB, LINKEDIN } from '../lib/data';

/*
 * The finale bookends the film: the liquid returns, slower and dimmer,
 * under a black gauze - and the glass card floats on top of it.
 */
export default function Contact() {
  return (
    <section id="contact" className="relative mt-[max(120px,16vh)] overflow-hidden">
      <IridescentCanvas speed={0.55} />
      <div aria-hidden className="absolute inset-0 bg-obsidian/70" />

      <div className="relative z-10 mx-auto max-w-[1240px] px-[max(20px,5vw)] py-[max(80px,12vh)] md:px-[max(24px,4vw)] md:py-[max(120px,16vh)]">
        <Reveal>
          <p className="text-label tracking-label uppercase text-paper/50">
            ( 05 ) - Contact
          </p>
        </Reveal>

        <div className="mt-40 grid items-center gap-40 md:mt-64 md:gap-64 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <h2 className="whisper">
                Let's make something{' '}
                <span className="serif-italic">quietly extraordinary.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-40 max-w-[440px] text-body leading-[1.45] text-paper/65">
                Hiring for frontend, UI/UX, or software engineering - or bringing
                a freelance project? My inbox is open.
              </p>
            </Reveal>

            {/* Four pills on one row wrap into a ragged three-row mess below
                ~640px. Portrait gives the primary action the full width and
                files the three destinations into an even rail beneath it. */}
            <Reveal delay={0.2}>
              <div className="mt-40 flex flex-col gap-12 md:mt-64 md:flex-row md:flex-wrap md:items-center">
                <HoldToCopy email={EMAIL} />
                <div className="grid grid-cols-3 gap-8 md:flex md:gap-12">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="glass glass-pill pill pill-dark pressable flex h-[46px] items-center justify-center text-body-sm md:h-auto md:px-[33px] md:py-[11px]"
                  >
                    Email ↗
                  </a>
                  <a
                    href={LINKEDIN}
                    target="_blank"
                    rel="noreferrer"
                    className="glass glass-pill pill pill-dark pressable flex h-[46px] items-center justify-center text-body-sm md:h-auto md:px-[33px] md:py-[11px]"
                  >
                    LinkedIn ↗
                  </a>
                  <a
                    href={GITHUB}
                    target="_blank"
                    rel="noreferrer"
                    className="glass glass-pill pill pill-dark pressable flex h-[46px] items-center justify-center text-body-sm md:h-auto md:px-[33px] md:py-[11px]"
                  >
                    GitHub ↗
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal
            delay={0.15}
            className="justify-self-center lg:justify-self-end"
          >
            <div>
              <BusinessCard3D />
              <p className="mt-28 text-center text-label tracking-label uppercase text-paper/40">
                <span className="md:hidden">Drag it - it comes back</span>
                <span className="hidden md:inline">Grab it - it comes back</span>
              </p>
            </div>
          </Reveal>
        </div>

        <footer className="mt-152 flex flex-col items-start gap-[14px] border-t border-paper/15 pt-40 text-label tracking-label uppercase text-paper/45 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-12">
          <span>© 2026 Danish Farhan Zailan</span>
          <span className="hidden md:inline">
            Designed & built from scratch - every easing hand-picked
          </span>
          <button
            onClick={scrollToTop}
            className="pressable tap flex items-center uppercase tracking-label text-paper/80"
          >
            Back to top ↑
          </button>
        </footer>
      </div>
    </section>
  );
}
