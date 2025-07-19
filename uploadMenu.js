
const admin = require("firebase-admin");
const xlsx = require("xlsx");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const workbook = xlsx.readFile("cleaned_menu_dataset.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet); // Uses headers from Excel

async function uploadMenu() {
  const menuRef = db.collection("menu");
  const batch = db.batch();

  data.forEach((item) => {
    const docRef = menuRef.doc(); // Auto ID

    // Convert tasteProfiles string to array
    if (typeof item.tasteProfiles === "string") {
      item.tasteProfiles = item.tasteProfiles.split(",").map(s => s.trim());
    }

    if (item.price) item.price = Number(item.price);
    if (item.pieces) item.pieces = Number(item.pieces);

    batch.set(docRef, item);
  });

  await batch.commit();
  console.log("✅ Menu uploaded to Firestore successfully!");
}

uploadMenu().catch((err) => {
  console.error("❌ Upload failed:", err.message);
});