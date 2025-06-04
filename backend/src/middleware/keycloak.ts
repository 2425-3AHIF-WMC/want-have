import session from "express-session";
import Keycloak from "keycloak-connect";
import { Request } from "express";

// Speicher für Session-Management
const memoryStore = new session.MemoryStore();

// Session-Middleware (muss **vor** Keycloak-Middleware eingebunden werden)
const sessionMiddleware = session({
    secret: "secret", // In Produktion sicherer setzen!
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
});

// Keycloak-Instanz mit Sessions
const keycloak = new Keycloak({ store: memoryStore });

// Wrapper für `protect` Middleware
const protect = keycloak.protect.bind(keycloak);

// Zusätzlicher Type Helper für req.kauth (inkl. id_token → für /logout)
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
            id_token: {
                token: string;
            };
        };
    };
}

export { sessionMiddleware, keycloak, protect, KeycloakRequest };
