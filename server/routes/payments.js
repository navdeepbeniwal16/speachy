// Load environment variables
require("dotenv").config();
const NODE_ENV = process.env.NODE_ENV;

const os = require("os");
const winston = require("winston");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { validationResult, check } = require("express-validator");
const firebaseAdmin = require("../configs/firebase-admin.js");
const { getFirestore } = require("firebase-admin/firestore");

const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
if (!STRIPE_API_KEY) {
  throw new Error("STRIPE_API_KEY not found in environment variables");
}
const stripe = require("stripe")(STRIPE_API_KEY);

// Set up logging
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "payments" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (NODE_ENV === "local") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const subscriptionsCheckoutSessionsState = {}; // Temporarily manages subscriptions checkout flow state key variables
const db = getFirestore(firebaseAdmin);

const updateCurrentUserSubscriptionDoc = async (subscriptionDocBody) => {
  const { userUID } = subscriptionDocBody;
  if (!userUID) {
    throw new Error("'userUID' not found");
  }

  const res = await db
    .collection("subscriptions")
    .doc(userUID)
    .set(subscriptionDocBody, { merge: true });

  logger.info("Current User Subscription Updated");
  logger.debug("Current User Subscription:", { res });
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

// Function to get the transfer protocol to use in the redirect url.
const getRedirectProtocol = () => {
  return NODE_ENV === "local" ? "http" : "https"; // Uses 'http' for local development, and 'https' for when in production
};

// Returns an array of validation middlewares for all of the passed in fields
const validateRequestBody = (fields) => [
  fields.map((field) =>
    check(field).notEmpty().withMessage(`${field} is required`)
  ),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(
        "One or multiple error occured during request body validation",
        { errors: errors }
      );
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

router.post(
  "/create-checkout-session",
  validateRequestBody(["userUID", "priceId"]),
  async (req, res) => {
    logger.info("Entered route /create-checkout-session");
    const { userUID, priceId } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${getRedirectProtocol()}://${getRedirectUrlIpAddress()}:${getRedirectPortNumber()}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getRedirectProtocol()}://${getRedirectUrlIpAddress()}:${getRedirectPortNumber()}/payment-canceled`,
        allow_promotion_codes: true,
      });

      logger.info("Checkout session successfuly created");
      logger.debug("Checkout session:", session);

      subscriptionsCheckoutSessionsState[session.id] = {
        sessionId: session.id,
        userUID,
      };

      logger.debug(
        "Checkout Session Initial Firebase Entry:",
        subscriptionsCheckoutSessionsState[session.id]
      );

      logger.info("Exiting route /create-checkout-session");
      res.json({ url: session.url });
    } catch (error) {
      logger.error("Error creating checkout session", { error });
      logger.info("Exiting route /create-checkout-session");
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

router.post(
  "/create-customer-portal",
  validateRequestBody(["userUID"]),
  async (req, res) => {
    logger.info("Inside /create-customer-portal route...");

    let userUID = req.body.userUID;
    logger.debug("userUID:", userUID);
    let stripeCustomerId; // unique id assigned to the customer by Stripe

    try {
      // Fetch user's subscription doc stored on firebase
      logger.info("Fetching user's subscription doc stored on firebase");
      const subscriptionRef = db.collection("subscriptions").doc(userUID);
      const doc = await subscriptionRef.get();
      if (!doc.exists) {
        throw new Error(
          `No subscription document found for userUID: ${userUID}`
        );
      }

      // Validate subscription doc data, and extract 'stripeCustomerId' out of it
      logger.info("Validating subscription doc data");
      const subscriptionData = doc.data();
      logger.debug(`Subscription Document for userUID ${userUID}:`, doc.data());
      if (!subscriptionData.stripeCustomerId) {
        return res.status(404).json({
          message: "Couldn't create a customer payment portal",
          error: "Customer's 'stripeCustomerId' not found",
        });
      }
      logger.debug("stripeCustomerId", stripeCustomerId);
      stripeCustomerId = subscriptionData.stripeCustomerId;

      // Create customer portal by calling Stripe API
      logger.info("Creating stripe customer portal");
      const returnUrl = `${getRedirectProtocol()}://${getRedirectUrlIpAddress()}:${getRedirectPortNumber()}`;
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnUrl,
      });

      logger.info("Customer portal successfully created");
      logger.debug("Customer portal redirect url:", portalSession.url);
      res.status(200).json({ url: portalSession.url });
    } catch (error) {
      logger.error("Error creating customer portal", { error });
      res.status(500).json({
        message:
          "Unknown error occurred while creating Stripe Customer Payment Portal",
        error: error.message,
      });
    }
  }
);

router.post(
  "/fetch-active-entitlements",
  validateRequestBody(["userUID"]),
  async (req, res) => {
    logger.info("Inside /fetch-active-entitlements route...");

    const userUID = req.body.userUID;
    logger.debug("userUID:", userUID);

    let stripeCustomerId;
    try {
      // Fetch user's subscription doc stored on firebase
      logger.info("Fetching user's subscription doc stored on firebase");
      const subscriptionRef = db.collection("subscriptions").doc(userUID);
      const doc = await subscriptionRef.get();
      if (!doc.exists) {
        throw new Error("No subscription document found");
      }

      // Validate subscription doc data, and extract 'stripeCustomerId' out of it
      logger.info("Validating subscription doc data");
      const subscriptionData = doc.data();
      logger.debug(`Subscription Document for userUID ${userUID}:`, doc.data());
      if (!subscriptionData.stripeCustomerId) {
        return res.status(404).json({
          message: "Customer's 'stripeCustomerId' not found",
        });
      }
      stripeCustomerId = subscriptionData.stripeCustomerId;

      // Fetch active entitlements belonging to user with the above stripeCustomerId
      const activeEntitlements =
        await stripe.entitlements.activeEntitlements.list({
          customer: stripeCustomerId,
        });

      res.json({ entitlements: activeEntitlements.data });
    } catch (error) {
      logger.error("Error fetching entitlements", { error });
      res.status(500).json({
        message:
          "Unknown error occurred while fetching entitlements from Stripe",
        error: error.message,
      });
    }
  }
);

router.post(
  "/webhook",
  bodyParser.raw({
    type: "application/json",
  }),
  async (req, res) => {
    logger.info("Inside payments/webhook...");

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
        logger.error("Webhook signature verification failed", { err });
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
      logger.warn("Webhook isn't signed");
    }

    logger.info("Stripe event received", { eventType });

    try {
      switch (eventType) {
        case "checkout.session.completed":
          // Payment is successful and the subscription is created. Provision the subscription and save the customer ID to your database.
          logger.debug("Checkout Session Completed Event Data:", { data });

          const sessionId = data.object.id;
          const stripeCustomerId = data.object.customer;
          const subscriptionId = data.object.subscription;

          logger.debug("sessionId:", sessionId);
          logger.debug("stripeCustomerId", stripeCustomerId);
          logger.debug("subscriptionId", subscriptionId);

          subscriptionsCheckoutSessionsState[sessionId] = {
            ...subscriptionsCheckoutSessionsState[sessionId],
            stripeCustomerId,
            subscriptionId,
          };

          logger.debug(
            "Subscription Document to Updated to:",
            subscriptionsCheckoutSessionsState[sessionId]
          );

          await updateCurrentUserSubscriptionDoc(
            subscriptionsCheckoutSessionsState[sessionId]
          );
          break;

        case "invoice.paid":
          logger.debug("Invoice Paid Event Data", { data });
          break;
        case "invoice.payment_succeeded":
          logger.debug("Invoice Payment Succeed Event Data", { data });
          break;
        case "invoice.payment_failed":
          logger.warn("Invoice Payment Failed Event Data", { data });
          break;
        default:
          logger.info("Unhandled event type", { eventType });
      }
    } catch (error) {
      logger.error("Error handling Stripe webhook event", { error });
    }

    res.sendStatus(200);
  }
);

module.exports = router;
