// Load environment variables
require("dotenv").config();

const os = require("os");

const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const bodyParser = require("body-parser");
const NODE_ENV = process.env.NODE_ENV;

const subscriptionsCheckoutSessionsState = {};

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
  const { userUID, priceId } = req.body;

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

    console.log("Checkout Session:", session);
    // TODO: Move the following update to Firestore
    subscriptionsCheckoutSessionsState[session.id] = {
      sessionId: session.id,
      userUID: userUID,
    };
    console.log(
      "SubscriptionsCheckoutSession:",
      subscriptionsCheckoutSessionsState[session.id]
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/webhook",
  bodyParser.raw({
    type: "application/json",
  }),
  async (req, res) => {
    console.log("Entering payments/webhook ...");
    let data;
    let eventType;
    // Check if webhook signing is configured.
    const webhookSecret =
      "whsec_9de8a314b95759aca89944c02b47ca5b642f2570b07ab5bbc82346b4b3d8a4cc";
    if (webhookSecret) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data;
      eventType = req.body.type;
      console.log("Webhook isn't signed...");
    }

    console.log("DATA:", data);
    console.log("EVENT_TYPE:", eventType);

    switch (eventType) {
      case "checkout.session.completed":
        // Payment is successful and the subscription is created.
        // You should provision the subscription and save the customer ID to your database.
        console.log("Payment is successful and the subscription is created...");
        const sessionId = data.object.id;
        const stripeCustomerId = data.object.customer;
        subscriptionsCheckoutSessionsState[sessionId]["stripeCustomerId"] =
          stripeCustomerId;
        console.log(
          "Subscription Checkout Session",
          subscriptionsCheckoutSessionsState[sessionId]
        );
        break;

      case "invoice.paid":
        // Continue to provision the subscription as payments continue to be made.
        // Store the status in your database and check when a user accesses your service.
        // This approach helps you avoid hitting rate limits.
        console.log("Invoice is paid...");
        break;
      case "invoice.payment_failed":
        // The payment failed or the customer does not have a valid payment method.
        // The subscription becomes past_due. Notify your customer and send them to the
        // customer portal to update their payment information.
        console.log("Invoice payment failed...");
        break;

      default:
        // Unhandled event type
        console.log("Unhandeled event...");
    }

    res.sendStatus(200);
  }
);

module.exports = router;
