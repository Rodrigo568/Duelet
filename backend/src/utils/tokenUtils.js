import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h"; // default to 24 hours if not set

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function createAccessToken(userId) {
    return await new SignJWT({})
        .setProtectedHeader({
            alg: "HS256",
            typ: "JWT",
        })
        .setSubject(String(userId))
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(secretKey);
}

export async function verifyAccessToken(token) {
    const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
    });

    return payload;
}
