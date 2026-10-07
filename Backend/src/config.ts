import dotenv from "dotenv";

dotenv.config();

// Secret used to sign and verify login tokens - kept in .env, not in code.
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from Backend/.env");
}
export const JWT_SECRET = process.env.JWT_SECRET;
