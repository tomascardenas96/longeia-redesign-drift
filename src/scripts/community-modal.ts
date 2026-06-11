/* Shows the community invitation modal once the hero intro finishes.
   The hero timeline ends with the scroll indicator's `rise` keyframe
   (~2.7s), so we wait for its animationend instead of hardcoding the
   full timeline; a timeout covers reduced-motion (animations are
   disabled there) and any markup drift. */

const SHOW_DELAY = 600;
const FALLBACK_TIMEOUT = 3800;
const REDUCED_MOTION_DELAY = 900;

export function initCommunityModal(): void {
  const modal = document.querySelector<HTMLElement>("[data-community-modal]");
  if (!modal) return;

  const dialog = modal.querySelector<HTMLElement>("[data-modal-dialog]");
  const closers = modal.querySelectorAll<HTMLElement>("[data-modal-close]");
  if (!dialog) return;

  let lastFocused: HTMLElement | null = null;

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key !== "Tab") return;

    const focusables = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const open = (): void => {
    lastFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("has-modal");
    document.addEventListener("keydown", onKeydown);
    dialog.focus();
  };

  const close = (): void => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("has-modal");
    document.removeEventListener("keydown", onKeydown);
    lastFocused?.focus();
  };

  closers.forEach((closer) => closer.addEventListener("click", close));

  let shown = false;
  const reveal = (): void => {
    if (shown) return;
    shown = true;
    window.setTimeout(open, SHOW_DELAY);
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const indicator = document.querySelector<HTMLElement>(
    ".hero__scroll-indicator",
  );

  if (!prefersReducedMotion && indicator) {
    indicator.addEventListener("animationend", (event) => {
      if (event.animationName === "rise") reveal();
    });
    window.setTimeout(reveal, FALLBACK_TIMEOUT);
  } else {
    window.setTimeout(reveal, REDUCED_MOTION_DELAY);
  }
}
