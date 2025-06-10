// src/routes/login.ts
import { Router } from "express";
import { protect, KeycloakRequest, keycloak } from "../middleware/keycloak";
import jwt from "jsonwebtoken";
import {StatusCodes} from "http-status-codes";

export const loginRouter = Router();

// 🔐 Protected login route to issue custom JWT
loginRouter.get("/", keycloak.protect(), (req, res) => {
    const kreq = req as KeycloakRequest;

    const userInfo = kreq.kauth?.grant?.access_token?.content;
    if (!userInfo) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Kein gültiger Zugriffstoken" });
        return;
    }

    const token = jwt.sign(
        { userId: userInfo.sub },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 3600000,
    });

    res.redirect("http://localhost:3000");
});

loginRouter.get("/me", keycloak.protect(), (req, res) => {
    const kreq = req as KeycloakRequest;
    const userInfo = kreq.kauth?.grant?.access_token?.content;

    if (!userInfo) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Token fehlt" });
        return;
    }

    res.json({
        id: userInfo.sub,
        username: userInfo.preferred_username,
        email: userInfo.email,
        name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`,
    });
});

loginRouter.get("/logout", keycloak.protect(), (req, res) => {
    (req as any).kauth.logout();
    res.redirect("/");
});
