import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
}

export const authenticateJWT = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Authorization header missing" });
        return; // kein Rückgabewert!
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Token missing" });
        return;
    }

    try {
        const decoded = jwt.decode(token);
        console.log("Decoded token:", decoded);

        const user = jwt.verify(token, secret) as JwtPayload;

        req.user = {
            id: user.userId,
            username: user.username,
            email: user.email,
            name: user.name,
        };

        next();
    } catch (err) {
        res.status(StatusCodes.FORBIDDEN).json({ message: "Invalid or expired token!" });
        return;
    }
};
