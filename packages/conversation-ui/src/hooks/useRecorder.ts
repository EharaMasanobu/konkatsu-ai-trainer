"use client";

import { useCallback, useRef, useState } from "react";

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function getSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  return PREFERRED_MIME_TYPES.find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
}

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const releaseStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    chunksRef.current = [];

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("このブラウザでは録音がサポートされていません");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setAudioBlob(blob);
        setIsRecording(false);
        releaseStream();
      };

      recorder.onerror = () => {
        setError("録音中にエラーが発生しました");
        setIsRecording(false);
        releaseStream();
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      releaseStream();

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("マイクの使用が許可されていません。ブラウザの設定を確認してください");
        return;
      }

      if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("マイクが見つかりませんでした");
        return;
      }

      setError("録音を開始できませんでした");
    }
  }, [releaseStream]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      return;
    }

    recorder.stop();
    mediaRecorderRef.current = null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetAudio = useCallback(() => {
    setAudioBlob(null);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    clearError,
    resetAudio,
  };
}
