import express from "express";
import { getUsage } from "../controllers/usageController.js";

const router = express.Router();

router.get("/", getUsage);

export default router;