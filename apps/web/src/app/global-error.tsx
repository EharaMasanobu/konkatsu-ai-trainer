"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-zinc-900">
        <h1 className="text-xl font-semibold">エラーが発生しました</h1>
        <p className="max-w-md text-center text-sm text-zinc-600">
          {error.message || "予期しないエラーが発生しました。もう一度お試しください。"}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
        >
          再試行
        </button>
      </body>
    </html>
  );
}
