interface ConversationHeaderProps {
  currentTurn: number;
  maxTurn: number;
}

export function ConversationHeader({
  currentTurn,
  maxTurn,
}: ConversationHeaderProps) {
  return (
    <header className="safe-top shrink-0 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-between sm:max-w-3xl">
        <div>
          <h1 className="text-base font-bold text-zinc-900 sm:text-lg">会話トレーニング</h1>
          <p className="text-xs text-zinc-500 sm:text-sm">AI女性との初対面デート</p>
        </div>
        <div className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600">
          {currentTurn} / {maxTurn}
        </div>
      </div>
    </header>
  );
}
