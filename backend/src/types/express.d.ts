import { User } from '../models/User'; // Pfad anpassen, je nachdem wo User.ts liegt

declare global {
    namespace Express {
        interface Request {
            user?: User; // optional, weil es nicht immer gesetzt ist
        }
    }
}

export {};
