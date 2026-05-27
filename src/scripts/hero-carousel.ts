const VISIBLE_CARDS = 3;

export function initHeroCarousel(): void {
  const track = document.querySelector<HTMLElement>("[data-carousel-track]");
  const prev = document.querySelector<HTMLElement>("[data-carousel-prev]");
  const next = document.querySelector<HTMLElement>("[data-carousel-next]");

  if (!track || !prev || !next) return;

  const total = track.children.length;
  const maxIndex = Math.max(0, total - VISIBLE_CARDS);
  let index = 0;

  const render = (): void => {
    track.style.setProperty("--carousel-index", String(index));
    prev.dataset.disabled = index === 0 ? "true" : "false";
    next.dataset.disabled = index === maxIndex ? "true" : "false";
  };

  prev.addEventListener("click", () => {
    if (index === 0) return;
    index -= 1;
    render();
  });

  next.addEventListener("click", () => {
    if (index === maxIndex) return;
    index += 1;
    render();
  });

  render();
}
