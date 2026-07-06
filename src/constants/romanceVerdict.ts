export type RomanceVerdict =
  | "お断り"
  | "恋愛対象ではない"
  | "友達としてなら"
  | "また会ってみたい"
  | "かなり好印象・ぜひまた会いたい";

export interface RomanceVerdictBand {
  verdict: RomanceVerdict;
  label: string;
  min: number;
  max: number;
}

export const ROMANCE_VERDICT_BANDS: readonly RomanceVerdictBand[] = [
  {
    min: 0,
    max: 20,
    verdict: "お断り",
    label: "お断り",
  },
  {
    min: 21,
    max: 40,
    verdict: "恋愛対象ではない",
    label: "恋愛対象ではない",
  },
  {
    min: 41,
    max: 60,
    verdict: "友達としてなら",
    label: "友達としてなら",
  },
  {
    min: 61,
    max: 80,
    verdict: "また会ってみたい",
    label: "また会ってみたい",
  },
  {
    min: 81,
    max: 100,
    verdict: "かなり好印象・ぜひまた会いたい",
    label: "かなり好印象・ぜひまた会いたい",
  },
] as const;

export function resolveRomanceVerdict(romanceScore: number): RomanceVerdictBand {
  const clamped = Math.max(0, Math.min(100, Math.round(romanceScore)));

  const band =
    ROMANCE_VERDICT_BANDS.find(
      (entry) => clamped >= entry.min && clamped <= entry.max,
    ) ?? ROMANCE_VERDICT_BANDS[2];

  return band;
}
