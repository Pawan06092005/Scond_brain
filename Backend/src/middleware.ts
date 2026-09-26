// Importing required types and modules from "express" and "jsonwebtoken".
import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "./config"; // Importing the JWT secret key from a configuration file.
import jwt from "jsonwebtoken"; // Importing the jsonwebtoken library for token verification.

// Middleware to validate user authentication using a JWT token.
export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Extract the "authorization" header from the request.
    const header = req.headers["authorization"];

    // Reject if no token is provided
    if (!header) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }

    // Strip "Bearer " prefix if present
    const token = header.startsWith("Bearer ") ? header.slice(7) : header;

    try {
        // Verify the JWT token using the secret key. Throws if invalid/expired.
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded) {
            req.userId = (decoded as any).id;
            next();
        } else {
            res.status(401).json({ message: "Unauthorized User" });
        }
    } catch (e) {
        // jwt.verify throws JsonWebTokenError for invalid tokens — catch it gracefully
        res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};