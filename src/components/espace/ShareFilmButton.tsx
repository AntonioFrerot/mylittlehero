"use client";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import { useCallback, useState } from "react";

type ShareFilmButtonProps = {
  url: string;
  title: string;
  className?: string;
};

export function ShareFilmButton({ url, title, className = "" }: ShareFilmButtonProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      // Annulation ou partage indisponible : repli copie
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(t("space.shareFilmPrompt"), url);
    }
  }, [url, title, t]);

  return (
    <Button
      type="button"
      variant="secondary"
      className={`!text-sm ${className}`.trim()}
      onClick={handleShare}
      aria-live="polite"
    >
      {copied ? t("space.shareFilmCopied") : t("space.shareFilm")}
    </Button>
  );
}
