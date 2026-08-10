import express from 'express';
import cros from 'cors';
import aiRouter from './routes/aiRouter.js';
import usageRouter from './routes/usageRouter.js'


console.log("app.js loaded");
const app = express();

app.use(express.json());
app.use(cros());

app.get("/", (req, res) => {
    res.send("hello")
})

app.use("/api/ai", aiRouter)
app.use("/api/usage", usageRouter);

export default app;