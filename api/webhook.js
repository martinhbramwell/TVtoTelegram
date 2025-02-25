import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // adjust as needed
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("TradingView webhook invoked at:", new Date().toISOString());
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    console.log("Raw payload:", req.body);

    // Determine if the incoming body is a string (plain text) or already an object.
    let alertText;
    if (typeof req.body === "string") {
      alertText = req.body;
    } else if (typeof req.body === "object" && req.body !== null) {
      // If it's an object but not the expected JSON format, try to extract the message.
      alertText = req.body.message || JSON.stringify(req.body);
    } else {
      alertText = String(req.body);
    }

    // Wrap the plain text into a JSON object.
    const alertData = { message: alertText };

    // Insert the wrapped JSON into the alerts table.
    const query = "INSERT INTO alerts (alert_data) VALUES ($1) RETURNING id";
    const values = [alertData];
    const result = await pool.query(query, values);

    console.log("Inserted alert with ID:", result.rows[0].id);
    res.status(200).json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error inserting alert:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
