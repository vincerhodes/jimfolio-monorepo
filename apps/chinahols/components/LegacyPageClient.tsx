"use client";

import { useEffect } from "react";

type Props = {
  kind: "none" | "archive" | "content" | "planning";
  sections?: string[];
  scrollOffset?: number;
  chapterThreshold?: number;
};

export default function LegacyPageClient({
  kind,
  sections = [],
  scrollOffset = 64,
  chapterThreshold = 0.08,
}: Props) {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    const goToButtons = Array.from(document.querySelectorAll<HTMLElement>("[data-go-to]"));
    if (goToButtons.length > 0) {
      const listeners = goToButtons.map((button) => {
        const handler = () => {
          const targetId = button.dataset.goTo;
          if (!targetId) return;
          const target = document.getElementById(targetId);
          if (!target) return;
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - scrollOffset,
            behavior: "smooth",
          });
        };
        button.addEventListener("click", handler);
        return () => button.removeEventListener("click", handler);
      });
      cleanups.push(() => listeners.forEach((cleanup) => cleanup()));
    }

    if (kind === "archive") {
      const cards = Array.from(document.querySelectorAll<HTMLElement>(".option-card"));
      const itineraries = Array.from(document.querySelectorAll<HTMLElement>(".itinerary"));
      const ctaButtons = Array.from(document.querySelectorAll<HTMLElement>(".cta-btn[data-route]"));

      const switchRoute = (routeId: string) => {
        cards.forEach((card) => card.classList.toggle("active", card.dataset.route === routeId));
        itineraries.forEach((itinerary) => {
          const id = itinerary.id.replace("route-", "");
          itinerary.classList.toggle("visible", id === routeId);
        });
      };

      const cardListeners = cards.map((card) => {
        const handler = () => {
          if (card.dataset.route) {
            switchRoute(card.dataset.route);
          }
        };
        card.addEventListener("click", handler);
        return () => card.removeEventListener("click", handler);
      });

      const ctaListeners = ctaButtons.map((button) => {
        const handler = (event: Event) => {
          event.preventDefault();
          const route = button.dataset.route;
          if (!route) return;
          switchRoute(route);
          document.getElementById(`route-${route}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        };
        button.addEventListener("click", handler);
        return () => button.removeEventListener("click", handler);
      });

      const fadeElements = Array.from(document.querySelectorAll<HTMLElement>(".fade-in"));
      const fadeObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              fadeObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -40px 0px",
        },
      );
      fadeElements.forEach((element) => fadeObserver.observe(element));

      const scrollHint = document.querySelector<HTMLElement>(".hero-scroll-hint");
      const scrollHintHandler = () => {
        document.getElementById("routes")?.scrollIntoView({ behavior: "smooth" });
      };
      scrollHint?.addEventListener("click", scrollHintHandler);

      cleanups.push(() => cardListeners.forEach((cleanup) => cleanup()));
      cleanups.push(() => ctaListeners.forEach((cleanup) => cleanup()));
      cleanups.push(() => fadeObserver.disconnect());
      cleanups.push(() => scrollHint?.removeEventListener("click", scrollHintHandler));
    }

    if (kind === "content" || kind === "planning") {
      const chapters = Array.from(document.querySelectorAll<HTMLElement>(".chapter"));
      const chapterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              chapterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: chapterThreshold },
      );
      chapters.forEach((chapter) => chapterObserver.observe(chapter));
      cleanups.push(() => chapterObserver.disconnect());

      if (sections.length > 0) {
        const navButtons = Array.from(document.querySelectorAll<HTMLElement>(".sh-btn"));
        const onScroll = () => {
          let current = "";
          sections.forEach((id) => {
            const element = document.getElementById(id);
            if (element && window.scrollY >= element.offsetTop - 80) {
              current = id;
            }
          });
          navButtons.forEach((button, index) => button.classList.toggle("active", sections[index] === current));
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        cleanups.push(() => window.removeEventListener("scroll", onScroll));
      }
    }

    if (kind === "planning") {
      const storageKey = "chinahols-planning-checklist-v1";
      const checklistItems = Array.from(document.querySelectorAll<HTMLInputElement>(".packing-check input[type='checkbox']"));
      const checklistLabels = checklistItems.map((item) => item.closest(".packing-check")).filter(Boolean) as HTMLElement[];
      const completeEl = document.getElementById("checklist-complete");
      const remainingEl = document.getElementById("checklist-remaining");
      const filterButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".checklist-filter"));
      const resetButton = document.querySelector<HTMLButtonElement>(".checklist-reset");
      let currentFilter = "all";

      const readState = () => {
        try {
          return JSON.parse(window.localStorage.getItem(storageKey) || "{}") as Record<string, boolean>;
        } catch {
          return {};
        }
      };

      const saveState = (state: Record<string, boolean>) => {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(state));
        } catch {
        }
      };

      let state = readState();

      const updateSummary = () => {
        const complete = checklistItems.filter((item) => item.checked).length;
        if (completeEl) completeEl.textContent = String(complete);
        if (remainingEl) remainingEl.textContent = String(checklistItems.length - complete);
      };

      const applyFilter = () => {
        checklistLabels.forEach((label) => {
          const checked = !!label.querySelector<HTMLInputElement>("input")?.checked;
          const hide = currentFilter === "remaining" ? checked : currentFilter === "done" ? !checked : false;
          label.classList.toggle("is-hidden", hide);
          label.classList.toggle("is-done", checked);
        });
        filterButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.filter === currentFilter));
      };

      const sync = () => {
        checklistItems.forEach((item) => {
          item.checked = Boolean(state[item.id]);
        });
        updateSummary();
        applyFilter();
      };

      const itemListeners = checklistItems.map((item) => {
        const handler = () => {
          state[item.id] = item.checked;
          saveState(state);
          sync();
        };
        item.addEventListener("change", handler);
        return () => item.removeEventListener("change", handler);
      });

      const filterListeners = filterButtons.map((button) => {
        const handler = () => {
          currentFilter = button.dataset.filter || "all";
          applyFilter();
        };
        button.addEventListener("click", handler);
        return () => button.removeEventListener("click", handler);
      });

      const resetHandler = () => {
        if (window.confirm("Reset the whole packing checklist?")) {
          state = {};
          saveState(state);
          sync();
        }
      };
      resetButton?.addEventListener("click", resetHandler);

      sync();

      cleanups.push(() => itemListeners.forEach((cleanup) => cleanup()));
      cleanups.push(() => filterListeners.forEach((cleanup) => cleanup()));
      cleanups.push(() => resetButton?.removeEventListener("click", resetHandler));
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [chapterThreshold, kind, scrollOffset, sections]);

  return null;
}
