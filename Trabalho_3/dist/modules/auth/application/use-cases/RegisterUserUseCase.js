import { User } from "../../../users/domain/entities/User.js";
import { EmailAlreadyInUseError } from "../errors/EmailAlreadyInUseError.js";
export class RegisterUserUseCase {
    userRepository;
    passwordHasher;
    tokenService;
    constructor(userRepository, passwordHasher, tokenService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }
    async execute(input) {
        const existingUser = await this.userRepository.findByEmail(input.email.trim().toLowerCase());
        if (existingUser) {
            throw new EmailAlreadyInUseError();
        }
        const passwordHash = await this.passwordHasher.hash(input.password);
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
