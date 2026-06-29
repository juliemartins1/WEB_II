import crypto from "node:crypto";
export class PlaceholderPasswordHasher {
    async hash(value) {
        const salt = crypto.randomBytes(16).toString("hex");
        const hash = crypto.scryptSync(value, salt, 64).toString("hex");
        return `${salt}:${hash}`;
    }
    async compare(value, storedHash) {
        const [salt, hash] = storedHash.split(":");
        if (!salt || !hash) {
            return false;
        }
        const valueHash = crypto.scryptSync(value, salt, 64).toString("hex");
        return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(valueHash, "hex"));
    }
}
