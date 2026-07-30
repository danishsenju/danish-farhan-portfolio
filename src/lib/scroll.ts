import Lenis from 'lenis';

let lenis: Lenis | null = null;

// Strong ease-out - the glide the whole site speaks
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

export function initSmoothScroll(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {};
  }

  lenis = new Lenis({ lerp: 0.115 });

  let frame = 0;
  const raf = (time: number) => {
    lenis?.raf(time);
    frame = requestAnimationFrame(raf);
  };
  frame = requestAnimationFrame(raf);

  return () => {
    cancelAnimationFrame(frame);
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: -88, duration: 1.5, easing: easeOutQuart });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.5, easing: easeOutQuart });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
