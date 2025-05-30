import 'express';

declare module 'express' {
    interface Request {
        user?: {
            id: string; // adjust type if your user id is a number or something else
            // add other user properties here if needed
        };
    }
}
