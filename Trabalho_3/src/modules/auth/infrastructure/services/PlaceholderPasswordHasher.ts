import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";
import type { PasswordHasher } from "../../application/services/PasswordHasher.js";

export class PlaceholderPasswordHasher implements PasswordHasher {
  public async hash(_value: string): Promise<string> {
    throw new NotImplementedError("Implement password hashing service.");
  }

  public async compare(_value: string, _hash: string): Promise<boolean> {
    throw new NotImplementedError("Implement password comparison service.");
  }
}
