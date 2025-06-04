import session from "express-session";
import Keycloak from "keycloak-connect";
import { Request } from "express";

const memoryStore = new session.MemoryStore();

const sessionMiddleware = session({
    secret: "secret", // Change this in production
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
});

const keycloak = new Keycloak({ store: memoryStore });

const protect = keycloak.protect.bind(keycloak);

// Type helper
interface KeycloakRequest extends Request {
    kauth: {
        grant: {
            access_token: {
                content: {
                    preferred_username: string;
                    email?: string;
                    name?: string;
                    given_name?: string;
                    family_name?: string;
                };
            };
        };
    };
}

export { sessionMiddleware, keycloak, protect, KeycloakRequest };