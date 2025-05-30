import {NextFunction, Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import jwt, {JwtPayload} from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();
const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
}
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Authentication required' });
        return;
    }

    jwt.verify(token, secret, (err, user) => {
        if (err || !user || typeof user !== "object" || !("id" in user)) {
            res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid or expired token!' });
            return;
        }

        req.user = { id: (user as JwtPayload).id as string };
        next();
    });
}
