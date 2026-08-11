import User from "../models/User.js";

import { hashPassword } from "../utils/passwordUtils.js";

import ConflictError from "../errors/ConflictError.js";
import ValidationError from "../errors/ValidationError.js";
import NotFoundError from "../errors/NotFoundError.js";

class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async createUser(userData) {
        const existingUser = await this.userRepository.findByEmail(userData.email);

        if (existingUser) {
            throw new ConflictError("A user with this email already exists.");
        }

        const passwordHash = await hashPassword(userData.password);

        const user = new User({
            name: userData.name,
            email: userData.email,
            passwordHash: passwordHash,
            timezone: userData.timezone ?? "UTC",
        });

        return await this.userRepository.create(user);
    }

    async getUserById(id) {
        if (!id) {
            throw new ValidationError("User ID is required.");
        }

        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundError("User not found.");
        }

        return user;
    }

    async getUserByEmail(email) {
        if (!email) {
            throw new ValidationError("User email is required.");
        }

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new NotFoundError("User not found.");
        }

        return user;
    }

    async updateUser(id, userData) {
        // TODO
    }

    async deleteUser(id) {
        if (!id) {
            throw new ValidationError("User ID is required.");
        }

        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundError("User not found.");
        }

        return await this.userRepository.delete(id);
    }
}

export default UserService;
