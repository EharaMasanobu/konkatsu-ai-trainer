"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

import { SessionService } from "@/services/SessionService";
import type { HomeForm } from "@/types/homeForm";
import type { Message } from "@/types/message";
import type { Session } from "@/types/session";

type NewMessage = Omit<Message, "id" | "createdAt">;

interface SessionContextValue {
  session: Session | null;
  messages: Message[];
  setSession: (session: Session) => void;
  createSession: (homeForm: HomeForm) => Session;
  getSession: () => Session | null;
  clearSession: () => void;
  addMessage: (message: NewMessage) => void;
  clearMessages: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const sessionService = new SessionService();

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const setSessionState = useCallback((newSession: Session): void => {
    setSession(newSession);
    setMessages([]);
  }, []);

  const createSession = useCallback((homeForm: HomeForm): Session => {
    const newSession = sessionService.createSession(homeForm);
    setSession(newSession);
    setMessages([]);
    return newSession;
  }, []);

  const getSession = useCallback((): Session | null => {
    return session;
  }, [session]);

  const addMessage = useCallback((message: NewMessage): void => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: uuidv4(),
        createdAt: new Date(),
      },
    ]);
  }, []);

  const clearMessages = useCallback((): void => {
    setMessages([]);
  }, []);

  const clearSession = useCallback((): void => {
    if (session) {
      sessionService.clearSession(session.sessionId);
    }
    setSession(null);
    setMessages([]);
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      messages,
      setSession: setSessionState,
      createSession,
      getSession,
      clearSession,
      addMessage,
      clearMessages,
    }),
    [
      session,
      messages,
      setSessionState,
      createSession,
      getSession,
      clearSession,
      addMessage,
      clearMessages,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}
