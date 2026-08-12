import Subject from "../models/Subject.js";

import ValidationError from "../errors/ValidationError.js";
import NotFoundError from "../errors/NotFoundError.js";

class SubjectService {
    constructor(subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    async createSubject(userId, subjectData) {
        if (!userId || !subjectData.name) {
            throw new ValidationError("User ID and subject name are required.");
        }

        const subject = new Subject({
            userId,
            name: subjectData.name,
            color: subjectData.color ?? null,
        });

        return await this.subjectRepository.create(subject);
    }

    async getSubjectById(id, userId) {
        if (!id || !userId) {
            throw new ValidationError("Subject ID and user ID are required.");
        }

        const subject = await this.subjectRepository.findById(id, userId);

        if (!subject) {
            throw new NotFoundError("Subject not found.");
        }

        return subject;
    }

    async getAllSubjectsByUserId(userId) {
        if (!userId) {
            throw new ValidationError("User ID is required.");
        }

        return await this.subjectRepository.findAllByUserId(userId);
    }

    async updateSubject(id, userId, subjectData) {
        if (!id || !userId) {
            throw new ValidationError("Subject ID and user ID are required.");
        }

        const subject = await this.subjectRepository.findById(id, userId);

        if (!subject) {
            throw new NotFoundError("Subject not found.");
        }

        if (subjectData.name !== undefined) {
            subject.name = subjectData.name;
        }

        if (subjectData.color !== undefined) {
            subject.color = subjectData.color;
        }

        return await this.subjectRepository.update(subject);
    }

    async deleteSubject(id, userId) {
        if (!id || !userId) {
            throw new ValidationError("Subject ID and user ID are required.");
        }

        const subject = await this.subjectRepository.findById(id, userId);

        if (!subject) {
            throw new NotFoundError("Subject not found.");
        }

        return await this.subjectRepository.deleteById(id, userId);
    }
}

export default SubjectService;
