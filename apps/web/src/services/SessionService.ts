import { v4 as uuidv4 } from "uuid";

import type { HomeForm, Session } from "@konkatsu/shared-types";

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

  getSession(_sessionId: string): Session | null {
    return null;
  }

  clearSession(_sessionId: string): void {
    // no-op
  }
}
