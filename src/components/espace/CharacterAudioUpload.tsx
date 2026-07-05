"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { RequiredFieldLabel } from "@/components/ui/RequiredFieldLabel";
import {
  MAX_CHARACTER_AUDIO_SECONDS,
  MIN_CHARACTER_AUDIO_SECONDS,
} from "@/lib/characters/audio-constants";
import { BTN_3D_SECONDARY_ACTION } from "@/lib/ui/button-3d-classes";

type CharacterAudioUploadProps = {
  currentAudioSrc?: string;
};

function formatSeconds(total: number): string {
  const seconds = Math.max(0, Math.floor(total));
  return `${seconds}s`;
}

function assignFileToInput(input: HTMLInputElement | null, file: File | null) {
  if (!input) return;
  const dataTransfer = new DataTransfer();
  if (file) {
    dataTransfer.items.add(file);
  }
  input.files = dataTransfer.files;
}

async function readAudioDuration(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<number>((resolve, reject) => {
      const audio = new Audio();
      audio.preload = "metadata";

      const cleanup = () => {
        audio.onloadedmetadata = null;
        audio.ondurationchange = null;
        audio.onerror = null;
        audio.ontimeupdate = null;
      };

      const finish = (duration: number) => {
        cleanup();
        if (Number.isFinite(duration) && duration > 0) {
          resolve(duration);
        } else {
          reject(new Error("invalid-duration"));
        }
      };

      const trySeekDuration = () => {
        audio.currentTime = Number.MAX_SAFE_INTEGER;
        audio.ontimeupdate = () => {
          audio.ontimeupdate = null;
          const duration = audio.duration;
          audio.currentTime = 0;
          finish(duration);
        };
      };

      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          finish(audio.duration);
          return;
        }
        if (audio.duration === Infinity) {
          trySeekDuration();
          return;
        }
        cleanup();
        reject(new Error("invalid-duration"));
      };

      audio.ondurationchange = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          finish(audio.duration);
        }
      };

      audio.onerror = () => {
        cleanup();
        reject(new Error("invalid-duration"));
      };

      audio.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function CharacterAudioUpload({ currentAudioSrc }: CharacterAudioUploadProps) {
  const { t } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recordStartedAtRef = useRef<number>(0);

  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAudioSrc ?? null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordElapsed, setRecordElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(currentAudioSrc ?? null);
    setDurationSeconds(null);
    setError(null);
    assignFileToInput(fileInputRef.current, null);
  }, [currentAudioSrc]);

  useEffect(() => {
    const form = fileInputRef.current?.closest("form");
    if (!form) return;

    const handleSubmit = (event: Event) => {
      const hasNewAudio = (fileInputRef.current?.files?.length ?? 0) > 0;
      if (!hasNewAudio && !currentAudioSrc) {
        event.preventDefault();
        setError(t("characters.errors.audioRequired"));
        return;
      }
      if (hasNewAudio && durationSeconds === null) {
        event.preventDefault();
        setError(t("characters.errors.audioDuration"));
      }
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [currentAudioSrc, durationSeconds, t]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      stopStream();
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [previewUrl]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const applyAudioFile = useCallback(
    async (file: File, knownDurationSeconds?: number) => {
      setError(null);
      setIsProcessingAudio(true);
      try {
        const duration =
          knownDurationSeconds !== undefined && Number.isFinite(knownDurationSeconds)
            ? knownDurationSeconds
            : await readAudioDuration(file);
        if (duration < MIN_CHARACTER_AUDIO_SECONDS) {
          setError(t("characters.errors.audioTooShort", { min: MIN_CHARACTER_AUDIO_SECONDS }));
          assignFileToInput(fileInputRef.current, null);
          setDurationSeconds(null);
          return;
        }
        if (duration > MAX_CHARACTER_AUDIO_SECONDS) {
          setError(t("characters.errors.audioTooLong", { max: MAX_CHARACTER_AUDIO_SECONDS }));
          assignFileToInput(fileInputRef.current, null);
          setDurationSeconds(null);
          return;
        }

        const roundedDuration = Math.round(duration * 10) / 10;
        setDurationSeconds(roundedDuration);
        assignFileToInput(fileInputRef.current, file);
        setPreviewUrl((prev) => {
          if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
          return URL.createObjectURL(file);
        });
      } catch {
        assignFileToInput(fileInputRef.current, null);
        setDurationSeconds(null);
        setError(t("characters.errors.audioInvalid"));
      } finally {
        setIsProcessingAudio(false);
      }
    },
    [t]
  );

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setDurationSeconds(null);
      return;
    }
    await applyAudioFile(file);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    clearTimer();
    const elapsed = Math.min(
      (Date.now() - recordStartedAtRef.current) / 1000,
      MAX_CHARACTER_AUDIO_SECONDS
    );
    setRecordElapsed(elapsed);
    setIsRecording(false);

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    stopStream();
    mediaRecorderRef.current = null;

    if (elapsed < MIN_CHARACTER_AUDIO_SECONDS) {
      setError(t("characters.errors.audioTooShort", { min: MIN_CHARACTER_AUDIO_SECONDS }));
      chunksRef.current = [];
      return;
    }

    const mimeType = recorder.mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];

    if (blob.size === 0) {
      setError(t("characters.errors.audioInvalid"));
      return;
    }

    const extension = mimeType.includes("mp4") ? "m4a" : "webm";
    const file = new File([blob], `voice-${Date.now()}.${extension}`, { type: mimeType });
    await applyAudioFile(file, elapsed);
  }, [applyAudioFile, t]);

  const startRecording = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t("characters.errors.audioRecordingUnsupported"));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const preferredTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const mimeType =
        preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = recorder;
      recordStartedAtRef.current = Date.now();
      setRecordElapsed(0);
      setIsRecording(true);
      recorder.start(200);

      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - recordStartedAtRef.current) / 1000;
        setRecordElapsed(elapsed);
        if (elapsed >= MAX_CHARACTER_AUDIO_SECONDS) {
          void stopRecording();
        }
      }, 100);
    } catch {
      stopStream();
      setError(t("characters.errors.audioMicrophoneDenied"));
    }
  };

  const canStopRecording = recordElapsed >= MIN_CHARACTER_AUDIO_SECONDS;

  return (
    <div className="flex flex-col gap-3">
      <RequiredFieldLabel>{t("characters.audioLabel")}</RequiredFieldLabel>

      {previewUrl ? (
        <audio controls src={previewUrl} className="w-full max-w-md" preload="metadata" />
      ) : (
        <div className="rounded-xl border border-dashed border-white/15 bg-cinema-black/40 px-4 py-5 text-sm text-cream/45">
          {t("characters.audioEmpty")}
        </div>
      )}

      <input
        type="hidden"
        name="audioDuration"
        value={durationSeconds !== null ? String(durationSeconds) : ""}
        readOnly
      />

      {isRecording ? (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-red-200">
            <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-red-400" />
            {t("characters.recordingInProgress")}
          </div>
          <p className="font-mono text-lg text-cream">
            {formatSeconds(recordElapsed)}{" "}
            <span className="text-cream/45">/ {MAX_CHARACTER_AUDIO_SECONDS}s</span>
          </p>
          <button
            type="button"
            onClick={() => void stopRecording()}
            disabled={!canStopRecording}
            className={`${BTN_3D_SECONDARY_ACTION} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {canStopRecording
              ? t("characters.stopRecording")
              : t("characters.stopRecordingWait", { min: MIN_CHARACTER_AUDIO_SECONDS })}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex flex-1 cursor-pointer flex-col gap-1">
            <span className={BTN_3D_SECONDARY_ACTION}>{t("characters.chooseAudio")}</span>
            <input
              ref={fileInputRef}
              type="file"
              name="audio"
              accept="audio/webm,audio/mp4,audio/mpeg,audio/wav,audio/ogg,audio/x-m4a,audio/x-wav,.mp3,.m4a,.wav,.ogg,.webm"
              className="sr-only"
              disabled={isProcessingAudio}
              onChange={(event) => void handleFileChange(event)}
            />
          </label>
          <button
            type="button"
            onClick={() => void startRecording()}
            disabled={isProcessingAudio}
            className={`${BTN_3D_SECONDARY_ACTION} flex-1 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {t("characters.recordAudio")}
          </button>
        </div>
      )}

      <span className="text-xs text-cream/45">
        {t("characters.audioHint", {
          min: MIN_CHARACTER_AUDIO_SECONDS,
          max: MAX_CHARACTER_AUDIO_SECONDS,
        })}
      </span>

      {isProcessingAudio ? (
        <p className="text-xs text-cream/55">{t("characters.audioProcessing")}</p>
      ) : null}

      {durationSeconds !== null && !error && !isProcessingAudio ? (
        <span className="text-xs text-gold-light/80">
          {t("characters.audioDurationSelected", { duration: formatSeconds(durationSeconds) })}
        </span>
      ) : null}

      {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
    </div>
  );
}
