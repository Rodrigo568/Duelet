class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async create(req, res) {
        const user = await this.userService.createUser(req.body);

        res.status(201).json({
            success: true,
            data: user,
        });
    }

    async getById(req, res) {
        const user = await this.userService.getUserById(req.params.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    }

    async getByEmail(req, res) {
        const user = await this.userService.getUserByEmail(req.params.email);

        res.status(200).json({
            success: true,
            data: user,
        });
    }

    async getMe(req, res) {
        const user = await this.userService.getUserById(req.user.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    }

    async update(req, res) {
        // TODO
    }

    async delete(req, res) {
        await this.userService.deleteUser(req.params.id);

        res.status(204).send();
    }

    async deleteMe(req, res) {
        await this.userService.deleteUser(req.user.id);

        res.status(204).send();
    }
}

export default UserController;
