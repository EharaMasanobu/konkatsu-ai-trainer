export type RomanceVerdict =
  | "お断り"
  | "恋愛対象ではない"
  | "友達としてなら"
  | "また会ってみたい"
  | "かなり好印象・ぜひまた会いたい";

export interface RomanceResult {
  verdict: RomanceVerdict;
  verdictLabel: string;
  reasons: string[];
  improvements: string[];
  romanceReasons: string[];
}
