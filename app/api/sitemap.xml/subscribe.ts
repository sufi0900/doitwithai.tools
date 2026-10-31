import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY; // Store your API key in an environment variable

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email } = req.body;

  // Validate input
  if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  try {
    // Make API call to MailerLite
    const response = await axios.post(
      "https://connect.mailerlite.com/api/subscribers",
      { email, name },
      {
        headers: {
          Authorization: `Bearer ${MAILERLITE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      return res.status(200).json({ message: "Successfully subscribed!" });
    } else {
      return res.status(response.status).json({ message: "Failed to subscribe" });
    }
  } catch (error) {
    console.error("MailerLite API Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
