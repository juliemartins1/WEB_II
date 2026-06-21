import type { Request, Response } from "express";

import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
import { EmailAlreadyInUseError } from "../../../application/errors/EmailAlreadyInUseError.js";
import type { RegisterUserUseCase } from "../../../application/use-cases/RegisterUserUseCase.js";

export class RegisterUserController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  public handle = async (request: Request, response: Response): Promise<Response> => {
    try {
      const result = await this.registerUserUseCase.execute({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password
      });

      return response.status(201).json({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        createdAt: result.user.createdAt,
        token: result.token
      });
    } catch (error) {
      if (error instanceof EmailAlreadyInUseError) {
        return response.status(409).json({ message: error.message });
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
