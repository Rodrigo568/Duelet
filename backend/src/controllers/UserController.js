class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async create(req, res, next) {
        try {
            const user = await this.userService.createUser(req.body);

            res.status(201).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        // TODO
    }

    async getByEmail(req, res, next) {
        // TODO
    }

    async update(req, res, next) {
        // TODO
    }

    async delete(req, res, next) {
        // TODO
    }
}

export default UserController;
