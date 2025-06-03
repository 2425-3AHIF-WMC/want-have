import { Router } from "express";
import { protect, KeycloakRequest } from "../middleware/keycloak";
import { Request, Response } from "express";

export const loginRouter = Router();

// Public route: Test‐Endpunkt
loginRouter.get("/", (_req: Request, res: Response) => {
    res.send("Hello from the public login router");
});

// Login‐Start: Keycloak übernimmt Redirect
loginRouter.get("/login", (req: Request, res: Response) => {
    // Keycloak Middleware leitet automatisch weiter
    (req as any).kauth.login();
});

// Protected route: eigene User‐Daten
loginRouter.get("/me", protect(), (req: Request, res: Response) => {
    const kreq = req as KeycloakRequest;
    const userInfo = kreq.kauth.grant.access_token.content;

    res.json({
        username: userInfo.preferred_username,
        email: userInfo.email,
        name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`,
    });
});

// Logout: Keycloak‐Abmeldung
loginRouter.get("/logout", protect(), (req: Request, res: Response) => {
    (req as any).kauth.logout();
    res.redirect("/");
});
