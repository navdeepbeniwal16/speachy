// Load environment variables
require("dotenv").config();

const os = require("os");

const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const bodyParser = require("body-parser");
const firebaseAdmin = require("../configs/firebase-admin.js");
const { getFirestore } = require("firebase-admin/firestore");

const NODE_ENV = process.env.NODE_ENV;

const subscriptionsCheckoutSessionsState = {};
const db = getFirestore(firebaseAdmin);

const updateCurrentUserSubscriptionDoc = async (subscriptionDocBody) => {
  const userUID = subscriptionDocBody.userUID || null;
  if (userUID) {
    const res = await db
      .collection("subscriptions")
      .doc(userUID)
      .set(subscriptionDocBody);
    console.log("Current User Subscription Updated:", res);
  } else {
    console.error("'userUID' not found");
    throw new Error("'userUID' not found");
  }
};

// Function to get the IP address of server to be redirected to. It's same as server when running in production
const getRedirectUrlIpAddress = () => {
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

// Function to get the PORT number of server to be redirected to. It's same as the server when running in production
const getRedirectPortNumber = () => {
  return NODE_ENV === "local" ? 3001 : process.env.PORT; // Check if it's local development environment or hosted environment
};

router.post("/create-checkout-session", async (req, res) => {
  console.log("Entered route /create-checkout-session");
  const { userUID, priceId } = req.body;

  // Get the IP address and port from where the react app is served
  const frontendLocalIp = getRedirectUrlIpAddress();
  const frontendPort = getRedirectPortNumber();

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

router.post("/create-customer-portal", async (req, res) => {
  console.log("Inside /create-customer-portal route...");
  console.log("userUID:", req.body.userUID);

  let customerId = req.body.userUID;
  if (!customerId) {
    console.error("Firebase 'customerId' not found in request body");
    return res.status(400).json({
      message: "Invalid request body",
      error: "Firebase customer id not found in the request body",
    });
  }

  // Fetch stripeCustomerId from firebase
  try {
    const subscriptionRef = db.collection("subscriptions").doc(customerId);
    const doc = await subscriptionRef.get();
    if (!doc.exists) {
      console.error("No subscription document found!");
      throw new Error("No subscription document found!");
    } else {
      console.log("Subscription Document Data:", doc.data());
      if (doc.data().stripeCustomerId) {
        customerId = doc.data().stripeCustomerId;
      } else {
        console.error("Customer's 'stripeCustomerId' not found");
        return res.status(404).json({
          message: "Couldn't create a customer payment protal",
          error: "Customer's 'stripeCustomerId' not found",
        });
      }
    }
  } catch (error) {
    console.error(
      "Unknown error occured while fetching subscription document:",
      error.message
    );
    return res.status(500).json({
      message: "Unknown error occured while fetching subscription document",
      error: error.message,
    });
  }

  // Create Stripe Customer Payments Portal
  try {
    const returnUrl = `http://${getRedirectUrlIpAddress()}:${getRedirectPortNumber()}`; // TODO: Dynamically decide between the 'http' & 'https' protocols
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error(
      "Unknown error occured while creating Stripe Customer Payment Portal"
    );
    res.status(500).json({
      message:
        "Unknown error occured while creating Stripe Customer Payment Portal",
      error: error.message,
    });
  }
});

router.post("/fetch-active-entitlements", async (req, res) => {
  console.log("Inside /fetch-active-entitlements route...");
  console.log("userUID:", req.body.userUID);

  let customerId = req.body.userUID;
  if (!customerId) {
    console.error("Firebase 'customerId' not found in request body");
    return res.status(400).json({
      message: "Invalid request body",
      error: "Firebase customer id not found in the request body",
    });
  }

  let stripeCustomerId;
  try {
    const subscriptionRef = db.collection("subscriptions").doc(customerId);
    const doc = await subscriptionRef.get();
    if (!doc.exists) {
      console.error("No subscription document found!");
      throw new Error("No subscription document found!");
    } else {
      console.log("Subscription Document Data:", doc.data());
      if (doc.data().stripeCustomerId) {
        stripeCustomerId = doc.data().stripeCustomerId;
      } else {
        console.error("Customer's 'stripeCustomerId' not found");
        return res.status(404).json({
          message: "Couldn't create a customer payment protal",
          error: "Customer's 'stripeCustomerId' not found",
        });
      }
    }
  } catch (error) {
    console.error(
      "Unknown error occured while fetching subscription document:",
      error.message
    );
    return res.status(500).json({
      message: "Unknown error occured while fetching subscription document",
      error: error.message,
    });
  }

  try {
    const activeEntitlements =
      await stripe.entitlements.activeEntitlements.list({
        customer: stripeCustomerId,
      });

    res.json({ entitlements: activeEntitlements.data });
  } catch (error) {
    console.error(
      "Unknown error occured while fetching entitlements from Stripe:",
      error.message
    );
    return res.status(500).json({
      message: "Unknown error occured while fetching entitlements from Stripe:",
      error: error.message,
    });
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
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
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

    switch (eventType) {
      case "checkout.session.completed":
        // Payment is successful and the subscription is created.
        // You should provision the subscription and save the customer ID to your database.
        console.log("EVENT:", eventType);
        console.log("Payment is successful and the subscription is created...");
        console.log("Checkout Session Completed Data:", data.object);

        try {
          const sessionId = data.object.id;
          const stripeCustomerId = data.object.customer;
          const subscriptionId = data.object.subscription;

          console.log("sessionId:", sessionId);
          console.log("stripeCustomerId", stripeCustomerId);
          console.log("subscriptionId", subscriptionId);

          subscriptionsCheckoutSessionsState[sessionId]["stripeCustomerId"] =
            stripeCustomerId;
          subscriptionsCheckoutSessionsState[sessionId]["subscriptionId"] =
            subscriptionId;

          console.log(
            "Subscription Checkout Session",
            subscriptionsCheckoutSessionsState[sessionId]
          );
          updateCurrentUserSubscriptionDoc(
            subscriptionsCheckoutSessionsState[sessionId]
          );
        } catch (error) {
          console.log("Error Updating Customer Subscription", error.message);
        }
        break;

      case "invoice.paid":
        // Continue to provision the subscription as payments continue to be made.
        // Store the status in your database and check when a user accesses your service.
        // This approach helps you avoid hitting rate limits.
        console.log("EVENT:", eventType);
        console.log("Invoice is paid...");
        console.log("Invoice Paid Data:", data.object);
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
