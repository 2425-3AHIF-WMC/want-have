// src/routes/login.ts
import { Router } from "express";
import { protect, KeycloakRequest, keycloak } from "../middleware/keycloak";
import jwt from "jsonwebtoken";

export const loginRouter = Router();
loginRouter.get("/login", keycloak.protect(), (req, res) => {
    const kreq = req as KeycloakRequest;
    const userInfo = kreq.kauth.grant.access_token.content;

    // 1. Eigenes JWT erstellen (für zusätzliche Sicherheit)
    const token = jwt.sign(
        { userId: userInfo.sub },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    // 2. Cookie setzen (für Frontend)
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,       // WICHTIG: Auf false setzen, da ihr HTTP verwendet!
        sameSite: "lax",    // "none" funktioniert nur mit HTTPS
        domain: "localhost",
        maxAge: 3600000
    });

    // 3. Weiterleiten zur Frontend-URL
    res.redirect("http://localhost:3000");
});

// Public endpoint to verify server works
loginRouter.get("/", (req, res) => {
    res.send("Hello from login router");
});

// Protected endpoint: get user info from Keycloak token
loginRouter.get("/me", protect(), (req, res) => {
    const kreq = req as KeycloakRequest;
    const userInfo = kreq.kauth.grant.access_token.content;

    res.json({
        id: userInfo.sub,
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