class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    async register(req, res) {
        const result = await this.authService.register(req.body);

        res.status(201).json({
            success: true,
            data: result,
        });
    }

    async login(req, res) {
        const result = await this.authService.login(req.body);

        res.status(200).json({
            success: true,
            data: result,
        });
    }
}

export default AuthController;
