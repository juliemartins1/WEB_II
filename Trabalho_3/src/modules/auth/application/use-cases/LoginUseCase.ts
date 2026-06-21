import type { User } from "../../../users/domain/entities/User.js";
import type { UserRepository } from "../../../users/domain/repositories/UserRepository.js";
import type { PasswordHasher } from "../services/PasswordHasher.js";
import type { TokenService } from "../services/TokenService.js";
import { NotImplementedError } from "../../../../shared/errors/NotImplementedError.js";

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginOutput = {
  user: User;
  token: string;
};

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  public async execute(_input: LoginInput): Promise<LoginOutput> {
    void this.userRepository;
    void this.passwordHasher;
    void this.tokenService;

    throw new NotImplementedError("Implement user login.");
  }
}
