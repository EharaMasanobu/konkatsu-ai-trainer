import { buttonPrimaryClassName } from "@/components/home/FormField";

export function StartButton() {
  return (
    <div className="safe-bottom sticky bottom-0 -mx-4 border-t border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
      <button type="submit" className={buttonPrimaryClassName}>
        会話を開始する
      </button>
    </div>
  );
}
