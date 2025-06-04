import { Router } from "express";
import { protect, KeycloakRequest } from "../middleware/keycloak";

export const loginRouter = Router();

loginRouter.get("/", (req, res) => {
    res.send("Hello from the public login router");
});

// Protected route
loginRouter.get("/me", protect(), (req, res) => {
    const kreq = req as KeycloakRequest;
    const userInfo = kreq.kauth.grant.access_token.content;

    res.json({
        username: userInfo.preferred_username,
        email: userInfo.email,
        name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`,
    });
});

// Logout (handled via Keycloak)
loginRouter.get("/logout", protect(), (req, res) => {
    (req as any).kauth.logout();
    res.redirect("/");
});