import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { GLIDE } from '../lib/Reveal';

/**
 * Renders /public image if present; otherwise a quiet placeholder telling you
 * exactly which file to drop in. Sharp corners, clip reveal on scroll, and an
 * internal parallax drift so the image moves slower than the page - depth,
 * like a camera dolly.
 */
export default function SmartImage({
  src,
  alt,
  aspect = 'aspect-[16/10]',
  fit = 'cover',
}: {
  src: string;
  alt: string;
  aspect?: string;
  fit?: 'cover' | 'contain';
}) {
  const [missing, setMissing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ['start end', 'end start'],
  });
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ['0%', '0%'] : ['-5.5%', '5.5%'],
  );

  /*
   * A closed clip-path paints nothing at all, so a reveal that never fires
   * doesn't degrade to "unanimated" - it degrades to a missing image. The
   * work gallery slides its panels in sideways from a will-change layer,
   * where an IntersectionObserver can sit silent through the whole pin, so
   * the observer gets a plain rect check behind it and both axes are tested:
   * a panel can be vertically on screen for the entire section and still be
   * parked off the right edge.
   */
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const onScreen = () => {
      const r = el.getBoundingClientRect();
      return (
        r.top < window.innerHeight - 120 &&
        r.bottom > 0 &&
        r.left < window.innerWidth &&
        r.right > 0
      );
    };

    let observer: IntersectionObserver | null = null;

    const stopWatching = () => {
      observer?.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };

    function check() {
      if (onScreen()) {
        setRevealed(true);
        stopWatching();
      }
    }

    if (onScreen()) {
      setRevealed(true);
      return;
    }

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) check();
        },
        { rootMargin: '-120px' },
      );
      observer.observe(el);
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);

    return stopWatching;
  }, []);

  const closed = {
    clipPath: reduce ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
    opacity: reduce ? 0 : 1,
  };
  const open = { clipPath: 'inset(0 0 0% 0)', opacity: 1 };

  return (
    <motion.div
      ref={frameRef}
      className={`img-frame relative w-full ${aspect} bg-[#111111]`}
      initial={closed}
      animate={revealed ? open : closed}
      transition={{ duration: 1.15, ease: GLIDE }}
    >
      {!missing ? (
        <motion.div
          className="absolute inset-x-0 -top-[10%] h-[120%]"
          style={{ y: parallaxY }}
        >
          <motion.img
            src={src}
            alt={alt}
            onError={() => setMissing(true)}
            className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
            initial={{ transform: reduce ? 'scale(1)' : 'scale(1.14)' }}
            animate={{
              transform: revealed || reduce ? 'scale(1)' : 'scale(1.14)',
            }}
            transition={{ duration: 1.4, ease: GLIDE }}
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-paper/40">
          <span className="text-label tracking-label uppercase">{alt}</span>
          <span className="text-caption">
            drop <code>{src.replace('/', 'public/')}</code> into the project
          </span>
        </div>
      )}
    </motion.div>
  );
}
