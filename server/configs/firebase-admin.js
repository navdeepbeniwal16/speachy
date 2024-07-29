const { initializeApp, cert } = require("firebase-admin/app");

const serviceAccount = require("../firebase-admin-security.json");

const firebaseAdmin = initializeApp({
  credential: cert(serviceAccount),
});

module.exports = firebaseAdmin;
