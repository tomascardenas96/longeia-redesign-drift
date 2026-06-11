/**
 * Reveals `.reveal` elements while they are in view by toggling
 * `is-visible`. The class is removed again when the element leaves the
 * viewport, so the same transition plays as an exit animation and the
 * entrance re-runs every time the element scrolls back in (not just on
 * first render). Respects prefers-reduced-motion (elements stay
 * visible).
 *
 * Containers marked `data-reveal-stagger` cascade their children in and
 * out: each child gets `.reveal-item` plus an incremental
 * `--reveal-delay` (step in ms taken from the attribute value, default
 * 80), and the whole group toggles when the container crosses the
 * viewport. Children only become hidden once this runs, so content
 * stays visible if JS never executes.
 */
const DEFAULT_STAGGER_MS = 80;

export function initReveal(): void {
  const singles = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
  const groups = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal-stagger]"),
  );
  if (singles.length === 0 && groups.length === 0) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
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

  const setVisible = (el: Element, visible: boolean) => {
    if (el instanceof HTMLElement && "revealStagger" in el.dataset) {
      el.querySelectorAll<HTMLElement>(":scope > .reveal-item").forEach(
        (child) => child.classList.toggle("is-visible", visible),
      );
    } else {
      el.classList.toggle("is-visible", visible);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        setVisible(entry.target, entry.isIntersecting);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );

  singles.forEach((el) => observer.observe(el));
  groups.forEach((el) => observer.observe(el));
}
