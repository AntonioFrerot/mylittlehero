"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type CharacterPhotoUploadProps = {
  currentPhotoSrc?: string;
  prenom?: string;
};

export function CharacterPhotoUpload({
  currentPhotoSrc,
  prenom,
}: CharacterPhotoUploadProps) {
  const { t } = useLocale();
  const [preview, setPreview] = useState<string | null>(currentPhotoSrc ?? null);

  useEffect(() => {
    setPreview(currentPhotoSrc ?? null);
  }, [currentPhotoSrc]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-cream/70">{t("characters.photoLabel")}</span>

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gold/30 bg-cinema-black shadow-glow-gold-subtle">
          {preview ? (
            <Image
              src={preview}
              alt={
                prenom
                  ? t("common.photoOf", { name: prenom })
                  : t("common.characterPreview")
              }
              fill
              className="object-cover"
              sizes="80px"
              unoptimized={preview.startsWith("blob:")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-cream/25">
              ?
            </div>
          )}
        </div>

        <label className="flex flex-1 cursor-pointer flex-col gap-1">
          <span className="inline-flex w-fit rounded-full border border-gold/40 bg-white/5 px-4 py-2 text-sm text-cream transition-colors hover:border-gold/70 hover:bg-white/10">
            {t("characters.choosePhoto")}
          </span>
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            required={!currentPhotoSrc}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setPreview((prev) => {
                if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                return URL.createObjectURL(file);
              });
            }}
          />
          <span className="text-xs text-cream/45">{t("characters.fileHint")}</span>
        </label>
      </div>
    </div>
  );
}
