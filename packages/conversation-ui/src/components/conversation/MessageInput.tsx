interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onSubmit?: () => void;
}

export function MessageInput({
  value,
  onChange,
  disabled,
  onSubmit,
}: MessageInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && onSubmit) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <label htmlFor="message-input" className="sr-only">
        メッセージ入力
      </label>
      <textarea
        id="message-input"
        rows={2}
        value={value}
        disabled={disabled}
        placeholder="メッセージを入力..."
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full resize-none rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 pr-12 text-base leading-snug text-zinc-900 focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/30 disabled:text-zinc-400"
      />
    </div>
  );
}
