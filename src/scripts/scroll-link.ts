/**
 * Scroll-linked entrances. Elements with `data-scroll-from="left|right"`
 * slide from that side toward their natural position as they travel up
 * the viewport, joining once they reach ~40% of its height — and slide
 * back apart as they keep travelling up and exit through the top.
 * `data-scroll-from="zoom"` scales up into place instead of sliding.
 * The transform is recomputed from the live scroll position every
 * frame, so the motion plays forward and in reverse as the user
 * scrolls. Past ~65% progress the element gets `is-visible`, letting
 * CSS choreograph inner content (e.g. the comunidad CTA text).
 *
 * `data-scroll-distance` (px) overrides how far off-position they start.
 * Skipped entirely under prefers-reduced-motion (elements stay put).
 */
const DEFAULT_DISTANCE_PX = 160;
const VISIBLE_AT_PROGRESS = 0.65;

export function initScrollLink(): void {
  const elements =
    document.querySelectorAll<HTMLElement>("[data-scroll-from]");
  if (elements.length === 0) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) return;

  const items = Array.from(elements).map((el) => ({
    el,
    mode: el.dataset.scrollFrom ?? "left",
    dir: el.dataset.scrollFrom === "right" ? 1 : -1,
    distance:
      Number.parseFloat(el.dataset.scrollDistance ?? "") ||
      DEFAULT_DISTANCE_PX,
  }));

  items.forEach(({ el }) => {
    el.style.willChange = "transform, opacity";
  });

  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    items.forEach(({ el, mode, dir, distance }) => {
      const rect = el.getBoundingClientRect();
      // Entering from below: 0 with the top at the viewport bottom edge,
      // 1 once it has risen to 40% of the viewport height.
      const entering = (vh - rect.top) / (vh * 0.6);
      // Exiting through the top: back to 0 as the bottom approaches the
      // top edge, so the columns split apart again on the way out.
      const exiting = rect.bottom / (vh * 0.45);
      const progress = Math.min(1, Math.max(0, Math.min(entering, exiting)));
      const eased = 1 - Math.pow(1 - progress, 3);
      el.style.transform =
        mode === "zoom"
          ? `scale(${0.88 + eased * 0.12})`
          : `translateX(${(1 - eased) * dir * distance}px)`;
      el.style.opacity = String(eased);
      el.classList.toggle("is-visible", progress > VISIBLE_AT_PROGRESS);
    });
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
