const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

exports.handler = async (event) => {
  const bill = JSON.parse(event.body);

  await db.collection("bills").doc("latest").set(bill);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, billUrl: "/view-bill" }),
    headers: { "Content-Type": "application/json" }
  };
};
