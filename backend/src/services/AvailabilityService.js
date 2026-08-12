import Availability from "../models/Availability.js";

import ValidationError from "../errors/ValidationError.js";
import NotFoundError from "../errors/NotFoundError.js";

class AvailabilityService {
    constructor(availabilityRepository) {
        this.availabilityRepository = availabilityRepository;
    }

    async createAvailability(userId, availabilityData) {
        if (!userId || !availabilityData.dayOfWeek || !availabilityData.startTime || !availabilityData.endTime) {
            throw new ValidationError("User ID, day of week, start time and end time are required.");
        }

        const availability = new Availability({
            userId,
            dayOfWeek: availabilityData.dayOfWeek,
            startTime: availabilityData.startTime,
            endTime: availabilityData.endTime,
        });

        return await this.availabilityRepository.create(availability);
    }

    async getAllAvailabilitiesByUserId(userId) {
        if (!userId) {
            throw new ValidationError("User ID is required.");
        }

        return await this.availabilityRepository.findAllByUserId(userId);
    }

    async updateAvailability(id, userId, availabilityData) {
        if (!id || !userId) {
            throw new ValidationError("Availability ID and user ID are required.");
        }

        const availability = await this.availabilityRepository.findById(id, userId);

        if (!availability) {
            throw new NotFoundError("Availability not found.");
        }

        if (availabilityData.dayOfWeek !== undefined) {
            availability.dayOfWeek = availabilityData.dayOfWeek;
        }
        if (availabilityData.startTime !== undefined) {
            availability.startTime = availabilityData.startTime;
        }
        if (availabilityData.endTime !== undefined) {
            availability.endTime = availabilityData.endTime;
        }

        return await this.availabilityRepository.update(availability);
    }

    async deleteAvailabilitybyId(id, userId) {
        if (!id || !userId) {
            throw new ValidationError("Availability ID and user ID are required.");
        }

        const availability = await this.availabilityRepository.findById(id, userId);

        if (!availability) {
            throw new NotFoundError("Availability not found.");
        }

        return await this.availabilityRepository.deleteById(id, userId);
    }
}

export default AvailabilityService;
