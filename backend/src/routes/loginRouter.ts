import Router from "express";
import express from "express";

export const loginRouter = Router();

loginRouter.get('/', (req, res) => {
    const {email, password} = req.body;
})
