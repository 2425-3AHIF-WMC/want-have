import { Router, Request, Response } from "express";
import { protect, KeycloakRequest, keycloak } from "../middleware/keycloak";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

export const loginRouter = Router();

loginRouter.get("/login", keycloak.protect(), (req: Request, res: Response) => {
    try {
        const userInfo = (req as KeycloakRequest).kauth.grant.access_token.content;

        const token = jwt.sign(
            { userId: userInfo.sub },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 3600000,
            path: "/"
        });

        res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
    } catch (error) {
        console.error("Login error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Login failed" });
    }
});

loginRouter.get("/me", protect(), (req: Request, res: Response) => {
    try {
        const userInfo = (req as KeycloakRequest).kauth.grant.access_token.content;
        res.json({
            id: userInfo.sub,
            username: userInfo.preferred_username,
            email: userInfo.email,
            name: userInfo.name || `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim()
        });
    } catch (error) {
        console.error("User info error:", error);
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Not authenticated" });
    }
});

loginRouter.get("/logout", protect(), (req: Request, res: Response) => {
    try {
        res.clearCookie("token");

        // Umleitung zum Keycloak-Logout-Endpunkt
        const redirectUri = encodeURIComponent(process.env.FRONTEND_URL || "http://localhost:3000");
        const logoutUrl = `https://auth.htl-leonding.ac.at/realms/htlleonding/protocol/openid-connect/logout?redirect_uri=${redirectUri}`;

        res.redirect(logoutUrl);
    } catch (error) {
        console.error("Logout error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Logout failed" });
    }
});
