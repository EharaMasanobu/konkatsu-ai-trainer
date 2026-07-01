export function parseHobbies(text: string): string[] {
  return text
    .split(/[,、\n]/)
    .map((hobby) => hobby.trim())
    .filter(Boolean);
}

export function formatHobbies(hobbies: string[]): string {
  return hobbies.join("\n");
}
