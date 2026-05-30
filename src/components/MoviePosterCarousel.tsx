"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type MoviePosterCarouselProps = {
  children: ReactNode;
  itemCount: number;
};

export function MoviePosterCarousel({
  children,
  itemCount,
}: MoviePosterCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const indices = useMemo(
    () => Array.from({ length: itemCount }, (_, index) => index),
    [itemCount]
  );

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    let raf = 0;
    const update = () => {
      if (!root) return;
      const center = root.scrollLeft + root.clientWidth / 2;

      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      Array.from(root.children).forEach((child, index) => {
        const el = child as HTMLElement;
        const childCenter = el.offsetLeft + el.offsetWidth / 2;
        const dist = Math.abs(center - childCenter);
        if (dist < bestDistance) {
          bestDistance = dist;
          bestIndex = index;
        }
      });

      setActiveIndex(bestIndex);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(() => update());
    observer.observe(root);
    update();

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToIndex = (index: number) => {
    const root = scrollRef.current;
    if (!root) return;
    const target = root.children[index] as HTMLElement | undefined;
    if (!target) return;
    root.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  return (
    <div className="sm:hidden">
      <div
        ref={scrollRef}
        className="mt-1 -mx-4 flex gap-[6px] overflow-x-auto overscroll-x-contain px-4 pb-2 snap-x snap-mandatory scrollbar-hide"
      >
        {children}
      </div>

      <div className="mt-3 flex justify-center gap-2" aria-hidden>
        {indices.map((index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              type="button"
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
