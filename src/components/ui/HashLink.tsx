"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { resolveHomeSectionId } from "@/lib/navigation/home-sections";
import {
  dispatchHomeSectionScrollRequest,
  scheduleScrollToSectionAfterUnlock,
  setPendingHomeSectionScroll,
} from "@/lib/scroll-to-section";

type HashLinkProps = ComponentPropsWithoutRef<typeof Link>;

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.replace(/\/$/, "") || "/";
}

function parseHashHref(href: string) {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return null;

  const path = href.slice(0, hashIndex) || "/";
  const id = href.slice(hashIndex + 1);
  if (!id) return null;

  return { path, id };
}

export function HashLink({ href, onClick, ...props }: HashLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hrefString = typeof href === "string" ? href : href.pathname ?? "";

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const parsed = parseHashHref(hrefString);
    if (!parsed) return;

    const targetPath = normalizePath(parsed.path);
    const currentPath = normalizePath(pathname || "/");
    const sectionId = resolveHomeSectionId(parsed.id);

    if (targetPath === currentPath) {
      event.preventDefault();
      scheduleScrollToSectionAfterUnlock(sectionId);
      return;
    }

    event.preventDefault();
    if (targetPath === "/") {
      setPendingHomeSectionScroll(sectionId);
      router.push("/", { scroll: false });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          dispatchHomeSectionScrollRequest(sectionId);
        });
      });
      return;
    }
    router.push(`${targetPath}#${parsed.id}`, { scroll: false });
  };

  return (
    <Link href={href} scroll={false} onClick={handleClick} {...props} />
  );
}
