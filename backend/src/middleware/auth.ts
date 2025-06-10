import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Authentication required' });
        return;
    }

    try {
        const user = jwt.verify(token, secret) as JwtPayload;

        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name
        };

        next();
    } catch (err) {
        res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid or expired token!' });
    }
};
