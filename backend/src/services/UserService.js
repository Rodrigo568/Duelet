import User from "../models/User.js";
import { hashPassword } from "../utils/passwordUtils.js";

class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async createUser(userData) {
        const existingUser = await this.userRepository.findByEmail(userData.email);

        if (existingUser) {
            throw new Error("An user with this email already exists.");
        }

        const passwordHash = await hashPassword(userData.password);

        const user = new User({
            name: userData.name,
            email: userData.email,
            passwordHash: passwordHash,
            timezone: userData.timezone,
        });

        return await this.userRepository.create(user);
    }

    async getUserById(id) {
        if (!id) {
            throw new Error("User ID is required.");
        }
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new Error("User not found.");
        }

        return user;
    }

    async getUserByEmail(email) {
        if (!email) {
            throw new Error("User email is required.");
        }

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error("User not found.");
        }

        return user;
    }

    async updateUser(id, userData) {
        // TODO
    }
    async deleteUser(id) {
        if (!id) {
            throw new Error("User ID is required.");
        }
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new Error("User not found.");
        }

        return await this.userRepository.delete(id);
    }
}

export default UserService;
