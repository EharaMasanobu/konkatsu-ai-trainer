import type { HomeForm } from "@/types/homeForm";

export interface Session {
  sessionId: string;
  createdAt: Date;
  homeForm: HomeForm;
}
