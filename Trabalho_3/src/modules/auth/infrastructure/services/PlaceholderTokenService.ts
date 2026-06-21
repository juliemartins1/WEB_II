import jwt from "jsonwebtoken";
import { InvalidTokenError } from "../../application/errors/InvalidTokenError.js";
import type { AuthTokenPayload, TokenService } from "../../application/services/TokenService.js";

const SECRET = "trabalho-iii-secret";

export class PlaceholderTokenService implements TokenService {
  public async sign(payload: AuthTokenPayload): Promise<string> {
    return jwt.sign(payload, SECRET, { expiresIn: "1d" });
  }

  public async verify(token: string): Promise<AuthTokenPayload> {
    try {
      const decoded = jwt.verify(token, SECRET);

      if (typeof decoded !== "object" || typeof decoded.userId !== "string") {
        throw new InvalidTokenError();
      }

      return { userId: decoded.userId };
    } catch {
      throw new InvalidTokenError();
    }
  }
}
