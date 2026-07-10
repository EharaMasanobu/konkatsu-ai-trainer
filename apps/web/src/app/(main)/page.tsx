import { HomeForm } from "@/components/home/HomeForm";

export default function Home() {
  return (
    <main className="page-shell safe-top pb-6">
      <header className="py-5 text-center sm:py-8">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">婚活AIトレーナー</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 sm:text-base">
          AIが婚活女性を演じる、本番さながらの会話トレーニング
        </p>
      </header>
      <div className="mx-auto w-full max-w-lg sm:max-w-3xl">
        <HomeForm />
      </div>
    </main>
  );
}
