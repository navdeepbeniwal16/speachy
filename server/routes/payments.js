// Load environment variables
require("dotenv").config();

const os = require("os");

const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const NODE_ENV = process.env.NODE_ENV;

// Function to get the local IP address
const getLocalIpAddress = () => {
  if (NODE_ENV === "local") return "localhost";

  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over internal (i.e., 127.0.0.1) and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1"; // Fallback to localhost
};

router.post("/create-checkout-session", async (req, res) => {
  console.log("Entered route /create-checkout-session");
  const { priceId } = req.body;

  // Get the IP address and port from where the react app is served
  const frontendLocalIp = getLocalIpAddress();
  const frontendPort = NODE_ENV === "local" ? 3000 : process.env.PORT; // Check if it's local development environment or hosted environment

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `http://${frontendLocalIp}:${frontendPort}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://${frontendLocalIp}:${frontendPort}/payment-canceled`,
    });
    console.log(session.url);

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
