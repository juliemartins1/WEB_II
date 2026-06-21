import crypto from "node:crypto";
import type { PasswordHasher } from "../../application/services/PasswordHasher.js";

export class PlaceholderPasswordHasher implements PasswordHasher {
  public async hash(value: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(value, salt, 64).toString("hex");
    return `${salt}:${hash}`;
  }

  public async compare(value: string, storedHash: string): Promise<boolean> {
    const [salt, hash] = storedHash.split(":");

    if (!salt || !hash) {
      return false;
    }

    const valueHash = crypto.scryptSync(value, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(valueHash, "hex"));
  }
}
