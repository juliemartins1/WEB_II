import jwt from "jsonwebtoken";
import { InvalidTokenError } from "../../application/errors/InvalidTokenError.js";
const SECRET = "trabalho-iii-secret";
export class PlaceholderTokenService {
    async sign(payload) {
        return jwt.sign(payload, SECRET, { expiresIn: "1d" });
    }
    async verify(token) {
        try {
            const decoded = jwt.verify(token, SECRET);
            if (typeof decoded !== "object" || typeof decoded.userId !== "string") {
                throw new InvalidTokenError();
            }
            return { userId: decoded.userId };
        }
        catch {
            throw new InvalidTokenError();
        }
    }
}
