import { User } from "../../../users/domain/entities/User.js";
import type { UserRepository } from "../../../users/domain/repositories/UserRepository.js";
import type { PasswordHasher } from "../services/PasswordHasher.js";
import type { TokenService } from "../services/TokenService.js";
import { EmailAlreadyInUseError } from "../errors/EmailAlreadyInUseError.js";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export type RegisterUserOutput = {
  user: User;
  token: string;
};

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) { }

  public async execute(
    input: RegisterUserInput
  ): Promise<RegisterUserOutput> {

    const existingUser = await this.userRepository.findByEmail(
      input.email.trim().toLowerCase()
    );

    if (existingUser) {
      throw new EmailAlreadyInUseError();
    }

    const passwordHash = await this.passwordHasher.hash(
      input.password
    );

    const user = User.create({
      name: input.name,
      email: input.email,
      passwordHash
    });

    await this.userRepository.create(user);

    const token = await this.tokenService.sign({ userId: user.id });

    return {
      user,
      token
    };
  }
}