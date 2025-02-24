// api/webhook.js
import { Pool } from "pg";

// Initialize the pool outside of the handler for connection reuse
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Adjust this based on your Neon configuration
});

export default async function handler(req, res) {
  // Ensure only POST requests are accepted
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Log the webhook invocation
    console.log("TradingView webhook invoked at:", new Date().toISOString());
    console.log("Payload:", req.body);

    // Insert the alert into the database
    const query = "INSERT INTO alerts (alert_data) VALUES ($1) RETURNING id";
    const values = [req.body];
    const result = await pool.query(query, values);

    console.log("Inserted alert with ID:", result.rows[0].id);

    // Respond to confirm receipt of the webhook
    res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error inserting alert:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
