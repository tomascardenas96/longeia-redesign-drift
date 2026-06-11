/**
 * Reveals `.reveal` elements while they are in view by toggling
 * `is-visible`. The class is removed again when the element leaves the
 * viewport, so the same transition plays as an exit animation and the
 * entrance re-runs every time the element scrolls back in (not just on
 * first render). Respects prefers-reduced-motion (elements stay
 * visible).
 *
 * Visibility is computed per scroll frame from the offsetTop chain —
 * the *layout* position — instead of IntersectionObserver. IO measures
 * the transformed box, and the hidden state shifts elements by up to
 * 44px (`translateY`), so at the viewport edge each toggle moved the
 * element back across the threshold and undid the other one forever
 * while the scroll sat still. Layout coordinates ignore transforms, so
 * the toggle can't feed back into its own trigger.
 *
 * Containers marked `data-reveal-stagger` cascade their children in and
 * out: each child gets `.reveal-item` plus an incremental
 * `--reveal-delay` (step in ms taken from the attribute value, default
 * 80), and the whole group toggles when the container crosses the
 * viewport. Children only become hidden once this runs, so content
 * stays visible if JS never executes.
 */
const DEFAULT_STAGGER_MS = 80;
// Mirrors the previous IO config: threshold 0.15 with a -10% bottom
// rootMargin — visible once 15% of it is inside the viewport minus its
// bottom tenth.
const VISIBLE_RATIO = 0.15;
const BOTTOM_MARGIN_RATIO = 0.1;

export function initReveal(): void {
  const singles = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
  const groups = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal-stagger]"),
  );
  if (singles.length === 0 && groups.length === 0) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    singles.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  groups.forEach((group) => {
    const step =
      Number.parseInt(group.dataset.revealStagger ?? "", 10) ||
      DEFAULT_STAGGER_MS;
    Array.from(group.children).forEach((child, index) => {
      if (!(child instanceof HTMLElement)) return;
      child.classList.add("reveal-item");
      child.style.setProperty("--reveal-delay", `${index * step}ms`);
    });
  });

  const setVisible = (el: HTMLElement, visible: boolean) => {
    if ("revealStagger" in el.dataset) {
      el.querySelectorAll<HTMLElement>(":scope > .reveal-item").forEach(
        (child) => child.classList.toggle("is-visible", visible),
      );
    } else {
      el.classList.toggle("is-visible", visible);
    }
  };

  // Document-space top of the element's layout box. offsetTop ignores
  // transforms, unlike getBoundingClientRect.
  const layoutTop = (el: HTMLElement): number => {
    let top = 0;
    let node: HTMLElement | null = el;
    while (node) {
      top += node.offsetTop;
      node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
    }
    return top;
  };

  const targets = [...singles, ...groups];
  let ticking = false;

  const update = () => {
    ticking = false;
    const viewTop = window.scrollY;
    const viewBottom = viewTop + window.innerHeight * (1 - BOTTOM_MARGIN_RATIO);
    targets.forEach((el) => {
      const top = layoutTop(el);
      const height = el.offsetHeight;
      const visiblePx =
        Math.min(top + height, viewBottom) - Math.max(top, viewTop);
      // For elements taller than the viewport, 15% of their own height
      // may never fit — measure against whichever is smaller.
      const needed =
        VISIBLE_RATIO * Math.max(1, Math.min(height, viewBottom - viewTop));
      setVisible(el, visiblePx >= needed);
    });
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  // Late-loading images can shift layout without a scroll event.
  window.addEventListener("load", requestUpdate);
  update();
}
