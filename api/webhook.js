export default async function handler(req, res) {
  // Only allow POST requests (typical for TradingView webhooks)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Log the invocation to the server console
  console.log("TradingView webhook invoked at:", new Date().toISOString());
  console.log("Payload:", req.body);

  // Optionally, you can perform further processing here, e.g., validation, storing to DB, etc.

  // Respond to TradingView to confirm receipt
  res.status(200).json({ success: true, message: "Webhook received" });
}
