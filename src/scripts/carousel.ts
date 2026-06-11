/**
 * Generic scroll-snap carousel used by the Productos and Viandas sections.
 * Each carousel is a `[data-carousel]` container holding a
 * `[data-carousel-viewport]` (the scrollable track) plus prev/next buttons.
 */
export function initCarousels(): void {
  const carousels =
    document.querySelectorAll<HTMLElement>("[data-carousel]");

  carousels.forEach((carousel) => {
    const viewport = carousel.querySelector<HTMLElement>(
      "[data-carousel-viewport]",
    );
    const prev = carousel.querySelector<HTMLElement>("[data-carousel-prev]");
    const next = carousel.querySelector<HTMLElement>("[data-carousel-next]");
    const track = viewport?.firstElementChild as HTMLElement | null;

    if (!viewport || !prev || !next || !track) return;

    const step = (): number => {
      const card = track.children[0] as HTMLElement | undefined;
      if (!card) return viewport.clientWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
      return card.offsetWidth + gap;
    };

    const updateNav = (): void => {
      const maxScroll = viewport.scrollWidth - viewport.clientWidth - 1;
      prev.dataset.disabled = viewport.scrollLeft <= 0 ? "true" : "false";
      next.dataset.disabled =
        viewport.scrollLeft >= maxScroll ? "true" : "false";
    };

    prev.addEventListener("click", () => {
      viewport.scrollBy({ left: -step(), behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      viewport.scrollBy({ left: step(), behavior: "smooth" });
    });

    viewport.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
    updateNav();
  });
}
