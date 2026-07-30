import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { Asterisk } from 'lucide-react';
import { scrollToId, scrollToTop } from '../lib/scroll';

const LINKS: [string, string][] = [
  ['About', 'about'],
  ['Work', 'work'],
  ['Contact', 'contact'],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 text-paper">
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-paper/60"
        style={{ scaleX: progress }}
      />
      {/* Phone content runs much closer under the bar than desktop content
          does - a scrim keeps the labels legible without giving the whole
          bar a hard edge. Fades in with the same 500ms as the pill's glass. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian/85 via-obsidian/40 to-transparent transition-opacity duration-500 md:hidden ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <nav className="relative flex h-[58px] items-center justify-between px-[max(20px,5vw)] md:h-[66px] md:px-[max(24px,4vw)]">
        {/* The lockup the business card already carries, so the mark reads as
            the same identity in both places rather than two coincidences.
            Medium weight gives it presence against nav links that sit at 400
            and 80% opacity - a logo should be the heaviest thing in the bar,
            not tie with its own navigation. */}
        <button
          onClick={scrollToTop}
          aria-label="Danish Farhan, back to top"
          className="logo pressable flex items-center gap-[7px] text-[14px] font-medium lowercase tracking-[-0.01em] md:gap-8 md:text-body-sm"
        >
          <Asterisk aria-hidden strokeWidth={2} className="logo-mark size-[1.05em]" />
          danish farhan
        </button>

        <div
          className={`glass-pill flex items-center gap-[2px] p-[4px] transition-[background-color,border-color,box-shadow] duration-500 md:gap-[4px] md:px-[8px] md:py-[6px] ${
            scrolled ? 'glass' : 'border border-transparent'
          }`}
        >
          {LINKS.map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollToId(id)}
              className="pressable rounded-full px-[11px] py-[11px] text-label tracking-label uppercase opacity-80 transition-opacity duration-300 hover:opacity-100 md:px-[14px] md:py-[6px]"
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
