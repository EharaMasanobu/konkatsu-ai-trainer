import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">ページが見つかりません</h1>
      <p className="mt-2 text-sm text-zinc-600">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-600"
      >
        ホームへ戻る
      </Link>
    </main>
  );
}
