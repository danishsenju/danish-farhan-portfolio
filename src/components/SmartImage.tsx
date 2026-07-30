import { useRef, useState } from 'react';
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
 * internal parallax drift so the image moves slower than the page — depth,
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

  return (
    <motion.div
      ref={frameRef}
      className={`img-frame relative w-full ${aspect} bg-[#111111]`}
      initial={{
        clipPath: reduce ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
        opacity: reduce ? 0 : 1,
      }}
      whileInView={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
      viewport={{ once: true, margin: '-120px' }}
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
            whileInView={{ transform: 'scale(1)' }}
            viewport={{ once: true, margin: '-120px' }}
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
