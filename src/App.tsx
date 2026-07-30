import { useEffect } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Manifesto from './components/Manifesto';
import OutlineDivider from './components/OutlineDivider';
import Work from './components/Work';
import About from './components/About';
import Experience from './components/Experience';
import Contact from './components/Contact';
import { initSmoothScroll } from './lib/scroll';
import { generateDisplacementMap } from './lib/liquidGlass';

export default function App() {
  useEffect(() => initSmoothScroll(), []);

  // Feed the runtime-generated lens map into the SVG filter that .glass
  // panels reference via backdrop-filter: url(#liquid-glass)
  useEffect(() => {
    const map = generateDisplacementMap();
    if (map) document.getElementById('lg-map')?.setAttribute('href', map);
  }, []);

  return (
    <>
      <svg className="absolute h-0 w-0" aria-hidden>
        <filter
          id="liquid-glass"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            id="lg-map"
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="44"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div className="grain" aria-hidden />
      <Nav />
      <main>
        <Hero />
        <OutlineDivider text="ABOUT ME" speed={0.55} />
        <About />
        <Manifesto />
        <OutlineDivider text="SELECTED WORK" />
        <Work />
        <Experience />
        <Contact />
      </main>
    </>
  );
}
