import { Router, Request, Response } from "express";
import { protect, KeycloakRequest } from "../middleware/keycloak";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import {authenticateJWT} from "../middleware/auth";

export const loginRouter = Router();

loginRouter.get("/login", (req: Request, res: Response) => {
    try {
        // Authenticate via Keycloak
        return protect()(req as KeycloakRequest, res, () => {
            const kreq = req as KeycloakRequest;
            const userInfo = kreq.kauth?.grant?.access_token?.content;

            if (!userInfo) {
                res.status(StatusCodes.UNAUTHORIZED)
                    .json({ error: "Invalid authentication" });return;
            }

            // Create JWT
            const token = jwt.sign(
                {
                    userId: userInfo.sub,
                    username: userInfo.preferred_username
                },
                process.env.JWT_SECRET!,
                { expiresIn: "1h" }
            );

            // Set secure cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 3600000, // 1 hour
                path: "/",
                domain: process.env.NODE_ENV === "production"
                    ? "yourdomain.com"
                    : "localhost"
            });

            // Redirect to frontend
            res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");return;
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: "Login processing failed" });return;
    }
});

loginRouter.get("/", (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        status: "Server is running",
        timestamp: new Date().toISOString()
    });
});

loginRouter.get("/me", authenticateJWT, (req: Request, res: Response) => {
    try {
        const kreq = req as KeycloakRequest;
        const userInfo = kreq.kauth?.grant?.access_token?.content;

        if (!userInfo) {
             res.status(StatusCodes.UNAUTHORIZED)
                .json({ error: "Not authenticated" });return;
        }

        res.status(StatusCodes.OK).json({
            id: userInfo.sub,
            username: userInfo.preferred_username,
            email: userInfo.email,
            name: userInfo.name || `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim()
        });return;

    } catch (error) {
        console.error("User info error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: "Failed to fetch user data" });return;
    }
});

// 🚪 Logout endpoint (protected)
loginRouter.get("/logout", protect(), (req: Request, res: Response) => {
    try {
        const kreq = req as KeycloakRequest;

        // Clear cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            domain: process.env.NODE_ENV === "production"
                ? "yourdomain.com"
                : "localhost"
        });

        // Keycloak logout
        if (kreq.kauth?.logout) {
            kreq.kauth.logout();
        }

        // Redirect to frontend
        const redirectUrl = new URL(
            process.env.FRONTEND_URL || "http://localhost:3000"
        );
        redirectUrl.searchParams.set("logout", "true");

        res.redirect(redirectUrl.toString());return;

    } catch (error) {
        console.error("Logout error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: "Logout processing failed" });return;
    }
});