import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useMediaQuery } from '../lib/useMediaQuery';

const LABEL = 'View live';

/*
 * Two arrows in a one-em window: the first leaves along its own diagonal, the
 * second arrives on the same line behind it. The direction is the message -
 * this is the one control on the card that takes you off the site, and the
 * motion says so before the click does.
 */
function Arrows({ still }: { still: boolean }) {
  if (still) {
    return <ArrowUpRight aria-hidden strokeWidth={2} className="size-[1em]" />;
  }
  return (
    <span className="relative block size-[1em] overflow-hidden">
      <ArrowUpRight
        aria-hidden
        strokeWidth={2}
        className="view-live-arrow view-live-lead absolute inset-0 size-full"
      />
      <ArrowUpRight
        aria-hidden
        strokeWidth={2}
        className="view-live-arrow view-live-next absolute inset-0 size-full"
      />
    </span>
  );
}

export default function ViewLiveButton({
  url,
  className = '',
}: {
  url: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const ref = useRef<HTMLAnchorElement>(null);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const lift = useMotionValue(0);
  const press = useMotionValue(1);

  /* Springs rather than the raw pointer value: tying a transform straight to
     the cursor reads as a mechanism being driven, not an object being pushed.
     They also carry velocity through a direction change, so flicking across
     the button never hits a wall. */
  const glide = { stiffness: 260, damping: 22, mass: 0.5 };
  const rx = useSpring(tiltX, glide);
  const ry = useSpring(tiltY, glide);
  const lz = useSpring(lift, glide);
  // Press is a response, not a flourish - it settles inside the 100-160ms
  // budget instead of gliding like the tilt
  const scale = useSpring(press, { stiffness: 620, damping: 32, mass: 0.4 });

  /* One composed transform string, not Motion's rotateX/scale shorthands -
     the shorthands run through the main thread and drop frames while the
     work gallery is scrolling. */
  const transform = useMotionTemplate`perspective(520px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${lz}px) scale(${scale})`;

  // The highlight sits where the surface is tilted toward the light, so the
  // pill reads as a lit object rather than a rectangle with a gradient on it
  const sheenX = useTransform(ry, [-10, 10], [80, 20]);
  const sheenY = useTransform(rx, [-7, 7], [15, 85]);
  const sheen = useMotionTemplate`radial-gradient(130% 160% at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.20), rgba(255,255,255,0) 62%)`;

  const base = `view-live flex items-center justify-center gap-8 border border-paper/40 text-body-sm ${className}`;

  // A finger has no hover to track and reduced motion has no appetite for
  // parallax - both get the flat pill, which still presses
  if (reduce || !fine) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={`${base} pressable`}
      >
        {LABEL}
        <Arrows still />
      </a>
    );
  }

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    // Shallow on purpose: this is a 46px pill, not a business card. Past
    // about 8 degrees the text edge starts to visibly keystone.
    tiltX.set(-py * 7);
    tiltY.set(px * 10);
  };

  const rest = () => {
    tiltX.set(0);
    tiltY.set(0);
    lift.set(0);
    press.set(1);
  };

  return (
    <motion.a
      ref={ref}
      href={url}
      target="_blank"
      rel="noreferrer"
      onPointerMove={onMove}
      onPointerEnter={() => lift.set(7)}
      onPointerLeave={rest}
      onPointerDown={() => press.set(0.97)}
      onPointerUp={() => press.set(1)}
      onPointerCancel={rest}
      style={{ transform }}
      className={`${base} relative overflow-hidden`}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: sheen }}
      />
      <span className="relative flex items-center gap-8">
        {LABEL}
        <Arrows still={false} />
      </span>
    </motion.a>
  );
}
