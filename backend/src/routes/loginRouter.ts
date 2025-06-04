// src/routes/login.ts
import { Router } from "express";
import { protect, KeycloakRequest, keycloak } from "../middleware/keycloak";


export const loginRouter = Router();

loginRouter.get("/login", keycloak.protect());

// Public endpoint to verify server works
loginRouter.get("/", (req, res) => {
    res.send("Hello from login router");
});

// Protected endpoint: get user info from Keycloak token
loginRouter.get("/me", protect(), (req, res) => {
    const kreq = req as KeycloakRequest;
    const userInfo = kreq.kauth.grant.access_token.content;

    res.json({
        username: userInfo.preferred_username,
        email: userInfo.email,
        name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`,
    });
});

// Logout (redirects to Keycloak logout)
loginRouter.get("/logout", protect(), (req, res) => {
    (req as any).kauth.logout();
    res.redirect("/");
});
