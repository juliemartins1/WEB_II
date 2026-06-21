import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";
import type { AuthTokenPayload, TokenService } from "../../application/services/TokenService.js";

export class PlaceholderTokenService implements TokenService {
  public async sign(_payload: AuthTokenPayload): Promise<string> {
    throw new NotImplementedError("Implement token generation.");
  }

  public async verify(_token: string): Promise<AuthTokenPayload> {
    throw new NotImplementedError("Implement token verification.");
  }
}
