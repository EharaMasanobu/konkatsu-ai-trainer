import type { HomeForm } from "./homeForm";

export interface Session {
  sessionId: string;
  createdAt: Date;
  homeForm: HomeForm;
}
