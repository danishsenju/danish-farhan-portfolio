import { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { useMediaQuery } from '../lib/useMediaQuery';

export default function BusinessCard3D() {
  const reduce = useReducedMotion();
  const touch = useMediaQuery('(hover: none)');
  const [dragging, setDragging] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Pointer tilt - spring-interpolated so it has momentum, not a 1:1 stick
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 180, damping: 18, mass: 0.6 });
  const rotateY = useSpring(tiltY, { stiffness: 180, damping: 18, mass: 0.6 });

  // Flicking sideways banks the card into the throw
  const rotate = useTransform(x, [-320, 320], [-9, 9]);

  // Iridescent sheen sweeps across the black face as it tilts - the one
  // place the hero's liquid light touches the interface
  const glareX = useTransform(rotateY, [-16, 16], [82, 18]);
  const glareY = useTransform(rotateX, [-12, 12], [15, 85]);
  const glare = useMotionTemplate`
    radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 50%),
    linear-gradient(${glareX}deg, rgba(160,224,171,0.10), rgba(255,172,46,0.08) 50%, rgba(165,45,37,0.10))
  `;

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || dragging || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(-py * 12);
    tiltY.set(px * 16);
  };

  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <div
      ref={wrapperRef}
      className={reduce || dragging ? '' : 'float-idle'}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
    >
      {/* A finger can't hover, so the card never announces that it's
          draggable. Three short nudges do it, then the wrapper goes quiet
          for good - see .drag-hint. */}
      <div className={dragging ? '' : 'drag-hint'}>
        <motion.div
          /* Touch locks to the horizontal axis and leaves `pan-y` to the
             browser: a vertical swipe on the card scrolls the page instead
             of dragging a card nobody was trying to move. A mouse keeps
             both axes - a pointer can't scroll by dragging anyway. */
          drag={reduce ? false : touch ? 'x' : true}
          dragSnapToOrigin
          dragTransition={{ bounceStiffness: 260, bounceDamping: 17 }}
          onDragStart={() => {
            setDragging(true);
            resetTilt();
          }}
          onDragEnd={() => setDragging(false)}
          whileDrag={{ scale: 1.05 }}
          whileTap={{ cursor: 'grabbing' }}
          style={{
            x,
            y,
            rotateX,
            rotateY,
            rotate,
            transformPerspective: 1000,
            touchAction: touch ? 'pan-y' : 'none',
          }}
          className="glass relative aspect-[1.586/1] w-[min(400px,84vw)] cursor-grab select-none p-28 text-paper shadow-[rgba(0,0,0,0.55)_0px_28px_56px_-16px]"
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-body-sm font-normal">
                danish farhan<span className="align-super text-[8px]">®</span>
              </span>
              <span className="text-label tracking-label text-paper/60">
                KUL · MY
              </span>
            </div>

            <div className="flex items-end justify-between gap-12">
              <div>
                <p className="text-label tracking-label uppercase text-paper/60">
                  Design Engineer
                </p>
                <p className="mt-8 text-label tracking-label uppercase text-paper/60">
                  Est. 2021
                </p>
              </div>
              <span className="text-subheading leading-none text-paper/90">
                ✳
              </span>
            </div>
          </div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: glare }}
          />
        </motion.div>
      </div>
    </div>
  );
}
