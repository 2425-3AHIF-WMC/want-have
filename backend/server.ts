import express from "express";
import cors from "cors";
import { config } from "dotenv";

config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("MarktX API läuft!"));

app.listen(3000, () => console.log("Server läuft auf Port 3000"));
