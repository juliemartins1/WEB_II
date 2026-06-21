import type { Request, Response } from "express";

import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
import { InvalidCredentialsError } from "../../../application/errors/InvalidCredentialsError.js";
import type { LoginUseCase } from "../../../application/use-cases/LoginUseCase.js";

export class LoginController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  public handle = async (request: Request, response: Response): Promise<Response> => {
    try {
      const result = await this.loginUseCase.execute({
        email: request.body.email,
        password: request.body.password
      });

      return response.status(200).json({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        createdAt: result.user.createdAt,
        token: result.token
      });
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
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
