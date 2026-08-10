import express from "express";
import cors from "cors";
import aiRouter from "./routes/aiRouter.js";
import usageRouter from "./routes/usageRouter.js";

console.log("app.js loaded");

const app = express();

app.use(cors({
    origin: [
        "https://jazz-flow-ai-frontend.vercel.app",
        "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("hello");
});

app.use("/api/ai", aiRouter);
app.use("/api/usage", usageRouter);

export default app;