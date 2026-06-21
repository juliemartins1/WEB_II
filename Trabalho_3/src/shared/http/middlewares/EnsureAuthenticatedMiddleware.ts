import type { NextFunction, Request, Response } from "express";

import { InvalidTokenError } from "../../../modules/auth/application/errors/InvalidTokenError.js";
import type { TokenService } from "../../../modules/auth/application/services/TokenService.js";
import { NotImplementedError } from "../../errors/NotImplementedError.js";

export class EnsureAuthenticatedMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  public handle = async (request: Request, response: Response, next: NextFunction): Promise<void | Response> => {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return response.status(401).json({ message: "Authorization token is required." });
    }

    const [, token] = authorizationHeader.split(" ");

    if (!token) {
      return response.status(401).json({ message: "Authorization token is required." });
    }

    try {
      const payload = await this.tokenService.verify(token);
      (request as Request & { auth: { userId: string } }).auth = {
        userId: payload.userId
      };

      next();
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        return response.status(401).json({ message: error.message });
      }

      if (error instanceof NotImplementedError) {
        return response.status(500).json({ message: error.message });
      }

      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }

      return response.status(500).json({ message: "Unexpected error." });
    }
  };
}
