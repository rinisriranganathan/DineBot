const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

exports.handler = async () => {
  const doc = await db.collection("bills").doc("latest").get();

  if (!doc.exists) {
    return { statusCode: 404, body: "No bill found." };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(doc.data(), null, 2),
    headers: { "Content-Type": "application/json" }
  };
};
