import { InvalidCredentialsError } from "../errors/InvalidCredentialsError.js";
export class LoginUseCase {
    userRepository;
    passwordHasher;
    tokenService;
    constructor(userRepository, passwordHasher, tokenService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }
    async execute(input) {
        const user = await this.userRepository.findByEmail(input.email.trim().toLowerCase());
        if (!user) {
            throw new InvalidCredentialsError();
        }
        const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);
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
