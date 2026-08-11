import { describe, expect, mock, test } from "bun:test";

import UserService from "../../../src/services/UserService.js";

describe("UserService", () => {
    describe("createUser", () => {
        test("creates a user when the email is not already registered", async () => {
            const userRepository = {
                findByEmail: mock(async () => null),

                create: mock(async (user) => ({
                    ...user,
                    id: 1,
                })),
            };

            const userService = new UserService(userRepository);

            const userData = {
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
                timezone: "America/Montevideo",
            };

            const user = await userService.createUser(userData);

            expect(user.id).toBe(1);
            expect(user.name).toBe("Rodrigo");
            expect(user.email).toBe("rodrigo@test.com");
            expect(user.timezone).toBe("America/Montevideo");

            expect(user.passwordHash).toBeDefined();
            expect(user.passwordHash).not.toBe("password123");

            expect(userRepository.findByEmail).toHaveBeenCalledWith("rodrigo@test.com");
            expect(userRepository.create).toHaveBeenCalledTimes(1);
        });

        test("throws when the email is already registered", async () => {
            const existingUser = {
                id: 1,
                name: "Rodrigo",
                email: "rodrigo@test.com",
            };

            const userRepository = {
                findByEmail: mock(async () => existingUser),
                create: mock(async () => null),
            };

            const userService = new UserService(userRepository);

            const userData = {
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
                timezone: "America/Montevideo",
            };

            await expect(userService.createUser(userData)).rejects.toThrow("A user with this email already exists.");

            expect(userRepository.findByEmail).toHaveBeenCalledWith("rodrigo@test.com");
            expect(userRepository.create).not.toHaveBeenCalled();
        });
        test("uses UTC when timezone is not provided", async () => {
            const userRepository = {
                findByEmail: mock(async () => null),

                create: mock(async (user) => ({
                    ...user,
                    id: 1,
                })),
            };

            const userService = new UserService(userRepository);

            const user = await userService.createUser({
                name: "Rodrigo",
                email: "rodrigo@test.com",
                password: "password123",
            });

            expect(user.timezone).toBe("UTC");
        });
    });

    describe("getUserById", () => {
        test("returns a user when it exists", async () => {
            const existingUser = {
                id: 1,
                name: "Rodrigo",
                email: "rodrigo@test.com",
            };

            const userRepository = {
                findById: mock(async () => existingUser),
            };

            const userService = new UserService(userRepository);

            const user = await userService.getUserById(1);

            expect(user).toEqual(existingUser);
            expect(userRepository.findById).toHaveBeenCalledWith(1);
            expect(userRepository.findById).toHaveBeenCalledTimes(1);
        });

        test("throws when the user does not exist", async () => {
            const userRepository = {
                findById: mock(async () => null),
            };

            const userService = new UserService(userRepository);

            await expect(userService.getUserById(999)).rejects.toThrow("User not found.");

            expect(userRepository.findById).toHaveBeenCalledWith(999);
        });

        test("throws when the ID is missing", async () => {
            const userRepository = {
                findById: mock(async () => null),
            };

            const userService = new UserService(userRepository);

            await expect(userService.getUserById()).rejects.toThrow("User ID is required.");

            expect(userRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe("getUserByEmail", () => {
        test("returns a user when it exists", async () => {
            const existingUser = {
                id: 1,
                name: "Rodrigo",
                email: "rodrigo@test.com",
            };

            const userRepository = {
                findByEmail: mock(async () => existingUser),
            };

            const userService = new UserService(userRepository);

            const user = await userService.getUserByEmail("rodrigo@test.com");

            expect(user).toEqual(existingUser);

            expect(userRepository.findByEmail).toHaveBeenCalledWith("rodrigo@test.com");
            expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
        });

        test("throws when the user does not exist", async () => {
            const userRepository = {
                findByEmail: mock(async () => null),
            };

            const userService = new UserService(userRepository);

            await expect(userService.getUserByEmail("missing@test.com")).rejects.toThrow("User not found.");

            expect(userRepository.findByEmail).toHaveBeenCalledWith("missing@test.com");
        });

        test("throws when the email is missing", async () => {
            const userRepository = {
                findByEmail: mock(async () => null),
            };

            const userService = new UserService(userRepository);

            await expect(userService.getUserByEmail()).rejects.toThrow("User email is required.");

            expect(userRepository.findByEmail).not.toHaveBeenCalled();
        });
    });

    describe("deleteUser", () => {
        test("deletes a user when it exists", async () => {
            const existingUser = {
                id: 1,
                name: "Rodrigo",
                email: "rodrigo@test.com",
            };

            const userRepository = {
                findById: mock(async () => existingUser),
                delete: mock(async () => true),
            };

            const userService = new UserService(userRepository);

            const result = await userService.deleteUser(1);

            expect(result).toBe(true);

            expect(userRepository.findById).toHaveBeenCalledWith(1);
            expect(userRepository.delete).toHaveBeenCalledWith(1);

            expect(userRepository.findById).toHaveBeenCalledTimes(1);
            expect(userRepository.delete).toHaveBeenCalledTimes(1);
        });

        test("throws when the user does not exist", async () => {
            const userRepository = {
                findById: mock(async () => null),
                delete: mock(async () => true),
            };

            const userService = new UserService(userRepository);

            await expect(userService.deleteUser(999)).rejects.toThrow("User not found.");

            expect(userRepository.findById).toHaveBeenCalledWith(999);
            expect(userRepository.delete).not.toHaveBeenCalled();
        });

        test("throws when the ID is missing", async () => {
            const userRepository = {
                findById: mock(async () => null),
                delete: mock(async () => true),
            };

            const userService = new UserService(userRepository);

            await expect(userService.deleteUser()).rejects.toThrow("User ID is required.");

            expect(userRepository.findById).not.toHaveBeenCalled();
            expect(userRepository.delete).not.toHaveBeenCalled();
        });
    });
});
