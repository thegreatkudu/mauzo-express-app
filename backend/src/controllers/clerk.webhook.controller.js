import { Webhook } from "svix";
import { inngest } from "../config/inngest.js";
import { ENV } from "../config/env.js";

export async function handleClerkWebhook(req, res) {
  const webhookSecret = ENV.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const svixId = req.headers["svix-id"];
  const svixTimestamp = req.headers["svix-timestamp"];
  const svixSignature = req.headers["svix-signature"];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: "Missing svix headers" });
  }

  let payload;
  try {
    const wh = new Webhook(webhookSecret);
    payload = wh.verify(req.body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Clerk webhook verification failed:", err.message);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const { type, data } = payload;

  // Map Clerk event type to Inngest event name: "user.created" → "clerk/user.created"
  try {
    await inngest.send({ name: `clerk/${type}`, data });
    console.log(`Inngest event sent: clerk/${type}`);
  } catch (err) {
    console.error("Failed to send Inngest event:", err.message);
    return res.status(500).json({ error: "Failed to forward webhook to Inngest" });
  }

  res.status(200).json({ received: true });
}
