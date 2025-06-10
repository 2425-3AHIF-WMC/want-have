import * as express from 'express';
import { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username?: string;
                email?: string;
                name?: string;
            } & JwtPayload;
        }
    }
}
