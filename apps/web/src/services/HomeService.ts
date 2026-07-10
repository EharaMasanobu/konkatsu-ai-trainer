import type { HomeForm, Session } from "@konkatsu/shared-types";
import { SessionService } from "@/services/SessionService";

export class HomeService {
  constructor(private readonly sessionService: SessionService = new SessionService()) {}

  startConversation(formData: HomeForm): Session {
    return this.sessionService.createSession(formData);
  }
}
