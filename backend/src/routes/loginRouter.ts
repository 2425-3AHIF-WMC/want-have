import { Router, Request, Response } from "express";
import { protect, KeycloakRequest, keycloak } from "../middleware/keycloak";

export const loginRouter = Router();

// ✅ Öffentliche Route
loginRouter.get("/", (_req: Request, res: Response) => {
    res.send("Hello from the public login router");
});

// ✅ Login-Routen nicht manuell aufrufen – nutze Keycloak-Redirects
// Keycloak übernimmt den Login-Redirect automatisch

// ✅ Geschützte Route – Benutzerinfo abrufen
loginRouter.get("/me", protect(), (req: Request, res: Response) => {
    const kreq = req as KeycloakRequest;
    const userInfo = kreq.kauth.grant.access_token.content;

    res.json({
        username: userInfo.preferred_username,
        email: userInfo.email,
        name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`,
    });
});

// ✅ Logout via Redirect zur Keycloak-Logout-URL
loginRouter.get("/logout", protect(), (req: Request, res: Response) => {
    const kreq = req as KeycloakRequest;
    const redirectUri = encodeURIComponent("http://localhost:5173"); // ggf. Frontend-URL anpassen
    const logoutUrl = `${keycloak.config.realmUrl}/protocol/openid-connect/logout?redirect_uri=${redirectUri}&id_token_hint=${kreq.kauth.grant.id_token.token}`;
    res.redirect(logoutUrl);
});
