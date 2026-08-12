import { describe, expect, mock, test } from "bun:test";

import SubjectService from "../../../src/services/SubjectService.js";

describe("SubjectService", () => {
    describe("createSubject", () => {
        test("creates a subject for a user", async () => {
            const subjectRepository = {
                create: mock(async (subject) => ({
                    ...subject,
                    id: 1,
                })),
            };

            const subjectService = new SubjectService(subjectRepository);

            const userId = 1;
            const subjectData = {
                name: "Math",
                color: "#FF0000",
            };

            const subject = await subjectService.createSubject(userId, subjectData);

            expect(subject.id).toBe(1);
            expect(subject.userId).toBe(userId);
            expect(subject.name).toBe("Math");
            expect(subject.color).toBe("#FF0000");

            expect(subjectRepository.create).toHaveBeenCalledTimes(1);
        });

        test("throws when userId is missing", async () => {
            const subjectRepository = {
                create: mock(async () => null),
            };

            const subjectService = new SubjectService(subjectRepository);

            const subjectData = {
                name: "Math",
                color: "#FF0000",
            };

            await expect(subjectService.createSubject(null, subjectData)).rejects.toThrow(
                "User ID and subject name are required.",
            );
        });

        test("throws when subject name is missing", async () => {
            const subjectRepository = {
                create: mock(async () => null),
            };

            const subjectService = new SubjectService(subjectRepository);

            const userId = 1;
            const subjectData = {
                color: "#FF0000",
            };

            await expect(subjectService.createSubject(userId, subjectData)).rejects.toThrow(
                "User ID and subject name are required.",
            );
        });
    });

    describe("getSubjectById", () => {
        test("returns a subject when it exists", async () => {
            const existingSubject = {
                id: 1,
                userId: 1,
                name: "Math",
                color: "#FF0000",
            };

            const subjectRepository = {
                findById: mock(async () => existingSubject),
            };

            const subjectService = new SubjectService(subjectRepository);

            const subject = await subjectService.getSubjectById(1, 1);

            expect(subject).toEqual(existingSubject);
            expect(subjectRepository.findById).toHaveBeenCalledWith(1, 1);
            expect(subjectRepository.findById).toHaveBeenCalledTimes(1);
        });

        test("throws when the subject does not exist", async () => {
            const subjectRepository = {
                findById: mock(async () => null),
            };

            const subjectService = new SubjectService(subjectRepository);

            await expect(subjectService.getSubjectById(1, 1)).rejects.toThrow("Subject not found.");

            expect(subjectRepository.findById).toHaveBeenCalledWith(1, 1);
        });

        test("throws when the ID is missing", async () => {
            const subjectRepository = {
                findById: mock(async () => null),
            };

            const subjectService = new SubjectService(subjectRepository);

            await expect(subjectService.getSubjectById()).rejects.toThrow("Subject ID and user ID are required.");

            expect(subjectRepository.findById).not.toHaveBeenCalled();
        });

        test("throws when the user ID is missing", async () => {
            const subjectRepository = {
                findById: mock(async () => null),
            };

            const subjectService = new SubjectService(subjectRepository);

            await expect(subjectService.getSubjectById(1)).rejects.toThrow("Subject ID and user ID are required.");

            expect(subjectRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe("getAllSubjectsByUserId", () => {
        test("returns all subjects for a user", async () => {
            const existingSubjects = [
                { id: 1, userId: 1, name: "Math", color: "#FF0000" },
                { id: 2, userId: 1, name: "Science", color: "#00FF00" },
            ];

            const subjectRepository = {
                findAllByUserId: mock(async () => existingSubjects),
            };

            const subjectService = new SubjectService(subjectRepository);

            const subjects = await subjectService.getAllSubjectsByUserId(1);

            expect(subjects).toEqual(existingSubjects);
            expect(subjectRepository.findAllByUserId).toHaveBeenCalledWith(1);
            expect(subjectRepository.findAllByUserId).toHaveBeenCalledTimes(1);
        });

        test("throws when the user ID is missing", async () => {
            const subjectRepository = {
                findAllByUserId: mock(async () => null),
            };

            const subjectService = new SubjectService(subjectRepository);

            await expect(subjectService.getAllSubjectsByUserId()).rejects.toThrow("User ID is required.");

            expect(subjectRepository.findAllByUserId).not.toHaveBeenCalled();
        });
    });

    describe("updateSubject", () => {
        test("updates a subject when it exists", async () => {
            const existingSubject = {
                id: 1,
                userId: 1,
                name: "Math",
                color: "#FF0000",
            };

            const updatedSubjectData = {
                name: "Advanced Math",
                color: "#0000FF",
            };

            const subjectRepository = {
                findById: mock(async () => existingSubject),
                update: mock(async (subject) => subject),
            };

            const subjectService = new SubjectService(subjectRepository);

            const updatedSubject = await subjectService.updateSubject(1, 1, updatedSubjectData);

            expect(updatedSubject.name).toBe("Advanced Math");
            expect(updatedSubject.color).toBe("#0000FF");

            expect(subjectRepository.findById).toHaveBeenCalledWith(1, 1);
            expect(subjectRepository.update).toHaveBeenCalledTimes(1);
        });

        test("throws when the subject does not exist", async () => {
            const subjectRepository = {
                findById: mock(async () => null),
            };

            const subjectService = new SubjectService(subjectRepository);

            await expect(subjectService.updateSubject(1, 1, { name: "Advanced Math" })).rejects.toThrow(
                "Subject not found.",
            );

            expect(subjectRepository.findById).toHaveBeenCalledWith(1, 1);
        });

        test("throws when the ID is missing", async () => {
            const subjectRepository = {
                findById: mock(async () => null),
            };

            const subjectService = new SubjectService(subjectRepository);

            await expect(subjectService.updateSubject(null, 1, { name: "Advanced Math" })).rejects.toThrow(
                "Subject ID and user ID are required.",
            );

            expect(subjectRepository.findById).not.toHaveBeenCalled();
        });

        test("throws when the user ID is missing", async () => {
            const subjectRepository = {
                findById: mock(async () => null),
            };

            const subjectService = new SubjectService(subjectRepository);

            await expect(subjectService.updateSubject(1, null, { name: "Advanced Math" })).rejects.toThrow(
                "Subject ID and user ID are required.",
            );

            expect(subjectRepository.findById).not.toHaveBeenCalled();
        });
    });

    describe("deleteSubject", () => {
        test("deletes a subject when it exists", async () => {
            const existingSubject = {
                id: 1,
                userId: 1,
                name: "Math",
                color: "#FF0000",
            };

            const subjectRepository = {
                findById: mock(async () => existingSubject),
                deleteById: mock(async () => true),
            };

            const subjectService = new SubjectService(subjectRepository);

            const result = await subjectService.deleteSubject(1, 1);

            expect(result).toBe(true);

            expect(subjectRepository.findById).toHaveBeenCalledWith(1, 1);
            expect(subjectRepository.deleteById).toHaveBeenCalledWith(1, 1);

            expect(subjectRepository.findById).toHaveBeenCalledTimes(1);
            expect(subjectRepository.deleteById).toHaveBeenCalledTimes(1);
        });

        test("throws when the subject does not exist", async () => {
            const subjectRepository = {
                findById: mock(async () => null),
                deleteById: mock(async () => true),
            };

            const subjectService = new SubjectService(subjectRepository);

            await expect(subjectService.deleteSubject(1, 1)).rejects.toThrow("Subject not found.");

            expect(subjectRepository.findById).toHaveBeenCalledWith(1, 1);
            expect(subjectRepository.deleteById).not.toHaveBeenCalled();
        });

        test("throws when the ID is missing", async () => {
            const subjectRepository = {
                findById: mock(async () => null),
                deleteById: mock(async () => true),
            };

            const subjectService = new SubjectService(subjectRepository);

            await expect(subjectService.deleteSubject(null, 1)).rejects.toThrow("Subject ID and user ID are required.");

            expect(subjectRepository.findById).not.toHaveBeenCalled();
            expect(subjectRepository.deleteById).not.toHaveBeenCalled();
        });

        test("throws when the user ID is missing", async () => {
            const subjectRepository = {
                findById: mock(async () => null),
                deleteById: mock(async () => true),
            };

            const subjectService = new SubjectService(subjectRepository);

            await expect(subjectService.deleteSubject(1, null)).rejects.toThrow("Subject ID and user ID are required.");

            expect(subjectRepository.findById).not.toHaveBeenCalled();
            expect(subjectRepository.deleteById).not.toHaveBeenCalled();
        });
    });
});
