import { verifyAccessToken } from "../utils/tokenUtils.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";

export default async function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        throw new UnauthorizedError("Access token is required.");
    }

    const token = authorization.slice(7).trim();

    try {
        const payload = await verifyAccessToken(token);

        if (!payload.sub) {
            throw new UnauthorizedError("Invalid access token.");
        }

        const userId = Number(payload.sub);

        if (!Number.isInteger(userId) || userId <= 0) {
            throw new UnauthorizedError("Invalid access token.");
        }

        req.user = {
            id: userId,
        };

        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw error;
        }

        throw new UnauthorizedError("Invalid or expired access token.");
    }
}
