import { verifyPassword } from "../utils/passwordUtils.js";
import { createAccessToken } from "../utils/tokenUtils.js";

import ValidationError from "../errors/ValidationError.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";

class AuthService {
    constructor(userRepository, userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    async register(userData) {
        const user = await this.userService.createUser(userData);

        const accessToken = await createAccessToken(user.id);

        return {
            user,
            accessToken,
        };
    }

    async login(credentials) {
        if (!credentials.email || !credentials.password) {
            throw new ValidationError("Email and password are required.");
        }

        const user = await this.userRepository.findByEmail(credentials.email);

        if (!user) {
            throw new UnauthorizedError("Invalid email or password.");
        }

        const passwordIsValid = await verifyPassword(credentials.password, user.passwordHash);

        if (!passwordIsValid) {
            throw new UnauthorizedError("Invalid email or password.");
        }

        const accessToken = await createAccessToken(user.id);

        return {
            user,
            accessToken,
        };
    }
}

export default AuthService;
