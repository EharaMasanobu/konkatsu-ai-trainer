import type { HomeForm } from "@/types/homeForm";
import type { Session } from "@/types/session";
import { SessionService } from "@/services/SessionService";

export class HomeService {
  constructor(private readonly sessionService: SessionService = new SessionService()) {}

  startConversation(formData: HomeForm): Session {
    return this.sessionService.createSession(formData);
  }
}
