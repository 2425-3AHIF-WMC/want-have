import session from "express-session";
import Keycloak from "keycloak-connect";
import { Request, Response, NextFunction } from "express";

const memoryStore = new session.MemoryStore();

export const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: false,
    store: memoryStore,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 30 // 30 minutes
    }
});

const keycloakConfig = {
    realm: "htlleonding",
    "auth-server-url": "https://auth.htl-leonding.ac.at",
    "ssl-required": "external",
    resource: "htlleonding-service",
    "confidential-port": 0,
    "public-client": true
};

const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

export const protect = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        return keycloak.protect()(req as KeycloakRequest, res, next);
    };
};

// Erweiterte Typdefinition
declare module "express-session" {
    interface SessionData {
        token?: string;
    }
}

interface TokenContent {
    sub: string;
    preferred_username: string;
    email?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    realm_access?: {
        roles: string[];
    };
}

export interface KeycloakRequest extends Request {
    kauth: {
        grant: {
            access_token: {
                content: TokenContent;
                token: string;
            };
        };
    };
}

export { keycloak };