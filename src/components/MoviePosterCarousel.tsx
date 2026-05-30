"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type MoviePosterCarouselProps = {
  children: ReactNode;
  itemCount: number;
};

function getTargetScrollLeft(root: HTMLDivElement, index: number) {
  const child = root.children[index] as HTMLElement | undefined;
  if (!child) return 0;

  const targetCenter = child.offsetLeft + child.offsetWidth / 2;
  const maxScroll = Math.max(0, root.scrollWidth - root.clientWidth);
  return Math.max(0, Math.min(targetCenter - root.clientWidth / 2, maxScroll));
}

function getActiveIndex(root: HTMLDivElement) {
  const count = root.children.length;
  if (count <= 1) return 0;

  const scrollLeft = root.scrollLeft;
  const maxScroll = Math.max(0, root.scrollWidth - root.clientWidth);

  if (scrollLeft <= 1) return 0;
  if (scrollLeft >= maxScroll - 1) return count - 1;

  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < count; index += 1) {
    const distance = Math.abs(scrollLeft - getTargetScrollLeft(root, index));
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return bestIndex;
}

export function MoviePosterCarousel({
  children,
  itemCount,
}: MoviePosterCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const indices = useMemo(
    () => Array.from({ length: itemCount }, (_, index) => index),
    [itemCount],
  );

  const updateActiveIndex = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    setActiveIndex(getActiveIndex(root));
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActiveIndex);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("scrollend", updateActiveIndex);
    const observer = new ResizeObserver(updateActiveIndex);
    observer.observe(root);
    updateActiveIndex();

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("scrollend", updateActiveIndex);
      observer.disconnect();
    };
  }, [itemCount, updateActiveIndex]);

  const scrollToIndex = (index: number) => {
    const root = scrollRef.current;
    if (!root) return;

    const left = getTargetScrollLeft(root, index);
    root.scrollTo({ left, behavior: "smooth" });
    setActiveIndex(index);
  };

  return (
    <div className="sm:hidden [&_article>h3]:mt-1.5">
      <div
        ref={scrollRef}
        className="mt-1 -mx-4 flex gap-[6px] overflow-x-auto overscroll-x-contain px-4 snap-x snap-mandatory scrollbar-hide"
      >
        {children}
      </div>

      <div
        className="mt-1 flex justify-center gap-2"
        role="tablist"
        aria-label="Navigation des films d'exemple"
      >
        {indices.map((index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Film ${index + 1}`}
              onClick={() => scrollToIndex(index)}
              className={`rounded-full transition-all duration-200 ${
                isActive ? "h-2 w-2 bg-gold-light" : "h-1.5 w-1.5 bg-cream/30"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
