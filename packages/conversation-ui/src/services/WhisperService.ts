import type {
  TranscribeErrorResponse,
  TranscribeResponse,
} from "@konkatsu/shared-types";

export class WhisperNetworkError extends Error {
  constructor(message = "ネットワークエラーが発生しました") {
    super(message);
    this.name = "WhisperNetworkError";
  }
}

export class WhisperTranscriptionError extends Error {
  constructor(
    message = "文字起こしに失敗しました",
    readonly retryable = true,
  ) {
    super(message);
    this.name = "WhisperTranscriptionError";
  }
}

export class WhisperService {
  async transcribe(audioFile: File): Promise<string> {
    const formData = new FormData();
    formData.append("audio", audioFile);

    let response: Response;

    try {
      response = await fetch("/api/speech/transcribe", {
        method: "POST",
        body: formData,
      });
    } catch {
      throw new WhisperNetworkError();
    }

    if (!response.ok) {
      let message = "文字起こしに失敗しました";

      try {
        const body = (await response.json()) as TranscribeErrorResponse;
        if (body.error) {
          message = body.error;
        }
      } catch {
        // ignore JSON parse errors
      }

      if (response.status >= 500 || response.status === 429) {
        throw new WhisperTranscriptionError(message, true);
      }

      throw new WhisperTranscriptionError(message, false);
    }

    const data = (await response.json()) as TranscribeResponse;

    if (!data.text?.trim()) {
      throw new WhisperTranscriptionError("文字起こし結果が空でした", true);
    }

    return data.text.trim();
  }
}
