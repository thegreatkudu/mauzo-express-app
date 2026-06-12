import { Router } from "express";
import { handleClerkWebhook } from "../controllers/clerk.webhook.controller.js";

const router = Router();

// Raw body required for svix signature verification
router.post("/", handleClerkWebhook);

export default router;
