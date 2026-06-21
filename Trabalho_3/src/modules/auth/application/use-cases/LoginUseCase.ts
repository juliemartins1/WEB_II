import type { User } from "../../../users/domain/entities/User.js";
import type { UserRepository } from "../../../users/domain/repositories/UserRepository.js";
import type { PasswordHasher } from "../services/PasswordHasher.js";
import type { TokenService } from "../services/TokenService.js";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError.js";

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
  ) { }

  public async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(
      input.email.trim().toLowerCase()
    );

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const token = await this.tokenService.sign({ userId: user.id });

    return {
      user,
      token
    };
  }
}