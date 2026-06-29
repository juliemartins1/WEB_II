import { NotImplementedError } from "../../../../../shared/errors/NotImplementedError.js";
import { InvalidCredentialsError } from "../../../application/errors/InvalidCredentialsError.js";
export class LoginController {
    loginUseCase;
    constructor(loginUseCase) {
        this.loginUseCase = loginUseCase;
    }
    handle = async (request, response) => {
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
        }
        catch (error) {
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
