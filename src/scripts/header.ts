/**
 * Scroll-linked header entrance. The floating pill nav stays hidden over
 * the hero and drops into place as #about rises through the viewport:
 * progress goes 0 → 1 while #about's top travels from the bottom edge up
 * to ~55% of the viewport height. Recomputed from the live scroll
 * position every frame, so the bar retracts again when scrolling back up.
 *
 * Under prefers-reduced-motion the bar snaps shown/hidden at the same
 * threshold instead of travelling.
 */
const APPEAR_COMPLETE_AT = 0.55;
const HIDDEN_OFFSET_PCT = 140;

export function initHeader(): void {
  const bar = document.querySelector<HTMLElement>(".site-header__bar");
  const trigger = document.querySelector<HTMLElement>("#about");
  if (!bar || !trigger) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  bar.style.willChange = "transform, opacity";

  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const top = trigger.getBoundingClientRect().top;
    // 0 while #about is still below the fold; 1 once its top has risen
    // to APPEAR_COMPLETE_AT of the viewport height.
    let progress = Math.min(
      1,
      Math.max(0, (vh - top) / (vh * (1 - APPEAR_COMPLETE_AT))),
    );
    if (prefersReducedMotion) progress = progress > 0.5 ? 1 : 0;
    const eased = 1 - Math.pow(1 - progress, 3);
    bar.style.transform = `translateY(${(eased - 1) * HIDDEN_OFFSET_PCT}%)`;
    bar.style.opacity = String(eased);
    bar.classList.toggle("is-visible", progress > 0);
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
}
