import { describe, expect, mock, test } from "bun:test";

import AuthService from "../../../src/services/AuthService.js";
import { hashPassword } from "../../../src/utils/passwordUtils.js";
import { verifyAccessToken } from "../../../src/utils/tokenUtils.js";

describe("AuthService", () => {
    describe("register", () => {
        test("registers a user and returns an access token", async () => {
            const createdUser = {
                id: 1,
                name: "Rodrigo",
                email: "rodrigo@test.com",
                timezone: "America/Montevideo",
            };

            const userRepository = {};

            const userService = {
                createUser: mock(async () => createdUser),
            };

            const authService = new AuthService(userRepository, userService);

            const userData = {
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
                timezone: "America/Montevideo",
            };

            const result = await authService.register(userData);

            expect(result.user).toEqual(createdUser);
            expect(result.accessToken).toBeDefined();
            expect(typeof result.accessToken).toBe("string");

            expect(userService.createUser).toHaveBeenCalledWith(userData);
            expect(userService.createUser).toHaveBeenCalledTimes(1);

            const payload = await verifyAccessToken(result.accessToken);

            expect(payload.sub).toBe("1");
        });
    });

    describe("login", () => {
        test("returns user and access token when credentials are valid", async () => {
            const passwordHash = await hashPassword("password123");

            const existingUser = {
                id: 1,
                name: "Rodrigo",
                email: "rodrigo@test.com",
                passwordHash,
                timezone: "America/Montevideo",
            };

            const userRepository = {
                findByEmail: mock(async () => existingUser),
            };

            const userService = {};

            const authService = new AuthService(userRepository, userService);

            const result = await authService.login({
                email: "rodrigo@test.com",
                password: "password123",
            });

            expect(result.user).toEqual(existingUser);
            expect(result.accessToken).toBeDefined();

            expect(userRepository.findByEmail).toHaveBeenCalledWith("rodrigo@test.com");

            const payload = await verifyAccessToken(result.accessToken);

            expect(payload.sub).toBe("1");
        });

        test("throws when the user does not exist", async () => {
            const userRepository = {
                findByEmail: mock(async () => null),
            };

            const userService = {};

            const authService = new AuthService(userRepository, userService);

            await expect(
                authService.login({
                    email: "missing@test.com",
                    password: "password123",
                }),
            ).rejects.toThrow("Invalid email or password.");

            expect(userRepository.findByEmail).toHaveBeenCalledWith("missing@test.com");
        });

        test("throws when the password is incorrect", async () => {
            const passwordHash = await hashPassword("correct-password");

            const existingUser = {
                id: 1,
                email: "rodrigo@test.com",
                passwordHash,
            };

            const userRepository = {
                findByEmail: mock(async () => existingUser),
            };

            const userService = {};

            const authService = new AuthService(userRepository, userService);

            await expect(
                authService.login({
                    email: "rodrigo@test.com",
                    password: "wrong-password",
                }),
            ).rejects.toThrow("Invalid email or password.");
        });

        test("throws when the email is missing", async () => {
            const userRepository = {
                findByEmail: mock(async () => null),
            };

            const userService = {};

            const authService = new AuthService(userRepository, userService);

            await expect(
                authService.login({
                    password: "password123",
                }),
            ).rejects.toThrow("Email and password are required.");

            expect(userRepository.findByEmail).not.toHaveBeenCalled();
        });

        test("throws when the password is missing", async () => {
            const userRepository = {
                findByEmail: mock(async () => null),
            };

            const userService = {};

            const authService = new AuthService(userRepository, userService);

            await expect(
                authService.login({
                    email: "rodrigo@test.com",
                }),
            ).rejects.toThrow("Email and password are required.");

            expect(userRepository.findByEmail).not.toHaveBeenCalled();
        });
    });
});
