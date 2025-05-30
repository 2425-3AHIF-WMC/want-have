import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                // falls du mehr Felder hast, hier ergänzen
            }
        }
    }
}
