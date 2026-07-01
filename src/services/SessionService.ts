import { v4 as uuidv4 } from "uuid";

import type { HomeForm } from "@/types/homeForm";
import type { Session } from "@/types/session";

export interface SessionServiceInterface {
  createSession(homeForm: HomeForm): Session;
  getSession(sessionId: string): Session | null;
  clearSession(sessionId: string): void;
}

export class SessionService implements SessionServiceInterface {
  createSession(homeForm: HomeForm): Session {
    return {
      sessionId: uuidv4(),
      createdAt: new Date(),
      homeForm,
    };
  }

  getSession(sessionId: string): Session | null {
    void sessionId;
    // モック: API実装前はContextが正とするためnullを返す
    return null;
  }

  clearSession(sessionId: string): void {
    void sessionId;
    // モック: API実装前はno-op（DELETE /api/session/{id} に置き換え予定）
  }
}
