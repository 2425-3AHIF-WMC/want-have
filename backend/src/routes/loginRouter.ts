import { Router } from "express";
import { protect, KeycloakRequest } from "../middleware/keycloak";
import { Request, Response } from 'express';

export const loginRouter = Router();

// Public route
loginRouter.get("/", (req: Request, res: Response) => {
    res.send("Hello from the public login router");
});

// Protected route
loginRouter.get("/me", protect(), (req: Request, res: Response) => {
    const kreq = req as KeycloakRequest;
    const userInfo = kreq.kauth.grant.access_token.content;

    res.json({
        username: userInfo.preferred_username,
        email: userInfo.email,
        name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`,
    });
});

// Logout (handled via Keycloak)
loginRouter.get("/logout", protect(), (req: Request, res: Response) => {
    (req as any).kauth.logout();
    res.redirect("/");
});
