"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Toast } from "@/components/common/Toast";
import { useRecorder } from "@/hooks/useRecorder";
import {
  WhisperNetworkError,
  WhisperService,
  WhisperTranscriptionError,
} from "@/services/WhisperService";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void | Promise<void>;
  disabled?: boolean;
  compact?: boolean;
}

const whisperService = new WhisperService();

export function VoiceRecorder({
  onTranscript,
  disabled = false,
  compact = false,
}: VoiceRecorderProps) {
  const {
    isRecording,
    audioBlob,
    error: recorderError,
    startRecording,
    stopRecording,
    clearError,
    resetAudio,
  } = useRecorder();

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastFailedBlob, setLastFailedBlob] = useState<Blob | null>(null);

  const isProcessingRef = useRef(false);

  const transcribeBlob = useCallback(
    async (blob: Blob) => {
      setIsTranscribing(true);
      setTranscriptionError(null);
      setLastFailedBlob(null);

      const extension = blob.type.includes("mp4") ? "m4a" : "webm";
      const audioFile = new File([blob], `recording.${extension}`, {
        type: blob.type || "audio/webm",
      });

      try {
        const text = await whisperService.transcribe(audioFile);
        resetAudio();
        await onTranscript(text);
      } catch (err) {
        if (err instanceof WhisperNetworkError) {
          setToastMessage(err.message);
          setLastFailedBlob(blob);
          return;
        }

        if (err instanceof WhisperTranscriptionError) {
          setTranscriptionError(err.message);
          if (err.retryable) {
            setLastFailedBlob(blob);
          }
          return;
        }

        setTranscriptionError("文字起こしに失敗しました");
        setLastFailedBlob(blob);
      } finally {
        setIsTranscribing(false);
        isProcessingRef.current = false;
      }
    },
    [onTranscript, resetAudio],
  );

  useEffect(() => {
    if (!audioBlob || isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    void transcribeBlob(audioBlob);
  }, [audioBlob, transcribeBlob]);

  const handleRetry = useCallback(() => {
    if (!lastFailedBlob || isTranscribing) {
      return;
    }

    isProcessingRef.current = true;
    void transcribeBlob(lastFailedBlob);
  }, [isTranscribing, lastFailedBlob, transcribeBlob]);

  const isBusy = disabled || isTranscribing;
  const displayError = recorderError ?? transcriptionError;

  const content = (
    <>
      {!compact && (
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">音声入力</h2>
      )}

      {isRecording && (
        <div className="mb-3 flex items-center gap-2 text-sm text-red-600">
          <span
            className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-red-500"
            aria-hidden="true"
          />
          <span>録音中...</span>
        </div>
      )}

      {isTranscribing && (
        <div className="mb-3 flex items-center gap-2 text-sm text-zinc-600">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-rose-500" />
          <span>文字起こし中...</span>
        </div>
      )}

      {displayError && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <p>{displayError}</p>
          {recorderError && (
            <button
              type="button"
              onClick={clearError}
              className="touch-target mt-2 text-xs font-medium text-red-800 underline"
            >
              閉じる
            </button>
          )}
        </div>
      )}

      {transcriptionError && lastFailedBlob && (
        <div className="mb-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isTranscribing}
            className="touch-target rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 active:bg-rose-100 disabled:opacity-50"
          >
            再試行
          </button>
        </div>
      )}

      <div className={`flex gap-3 ${compact ? "" : "flex-wrap"}`}>
        <button
          type="button"
          onClick={() => void startRecording()}
          disabled={isBusy || isRecording}
          className={`touch-target rounded-xl bg-rose-500 font-semibold text-white active:bg-rose-700 disabled:bg-zinc-300 ${
            compact ? "flex-1 py-2.5 text-sm" : "px-4 py-2 text-sm"
          }`}
        >
          録音開始
        </button>
        <button
          type="button"
          onClick={stopRecording}
          disabled={!isRecording}
          className={`touch-target rounded-xl border border-zinc-300 bg-white font-semibold text-zinc-700 active:bg-zinc-50 disabled:border-zinc-200 disabled:text-zinc-400 ${
            compact ? "flex-1 py-2.5 text-sm" : "px-4 py-2 text-sm"
          }`}
        >
          録音停止
        </button>
      </div>
    </>
  );

  return (
    <>
      {compact ? (
        <div className="px-1">{content}</div>
      ) : (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          {content}
        </section>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}
