import Lenis from 'lenis';
import './styles/main.css';
import { initHeroCarousel } from './scripts/hero-carousel';
import { initCarousels } from './scripts/carousel';
import { initReveal } from './scripts/reveal';
import { initScrollLink } from './scripts/scroll-link';
import { initHeader } from './scripts/header';
import { initCommunityModal } from './scripts/community-modal';

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

if (!prefersReducedMotion) {
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

initHeroCarousel();
initCarousels();
initReveal();
initScrollLink();
initHeader();
initCommunityModal();
