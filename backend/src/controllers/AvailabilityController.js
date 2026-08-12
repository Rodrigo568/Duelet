class AvailabilityController {
    constructor(availabilityService) {
        this.availabilityService = availabilityService;
    }

    async createAvailability(req, res) {
        const userId = req.user.id;
        const availabilityData = req.body;

        const availability = await this.availabilityService.createAvailability(userId, availabilityData);

        res.status(201).json({
            success: true,
            data: availability,
        });
    }

    async getAllAvailabilities(req, res) {
        const userId = req.user.id;

        const availabilities = await this.availabilityService.getAllAvailabilities(userId);

        res.status(200).json({
            success: true,
            data: availabilities,
        });
    }

    async updateAvailability(req, res) {
        const userId = req.user.id;
        const availabilityId = req.params.id;
        const availabilityData = req.body;

        const updatedAvailability = await this.availabilityService.updateAvailability(
            userId,
            availabilityId,
            availabilityData,
        );

        res.status(200).json({
            success: true,
            data: updatedAvailability,
        });
    }

    async deleteAvailability(req, res) {
        const userId = req.user.id;
        const availabilityId = req.params.id;

        await this.availabilityService.deleteAvailability(userId, availabilityId);

        res.status(204).send();
    }
}

export default AvailabilityController;
