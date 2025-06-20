const fs = require("fs");
const path = require("path");

exports.handler = async () => {
  console.log("🔔 getBill function is loaded!");

  const filePath = path.join("/tmp", `latest.json`);

  if (!fs.existsSync(filePath)) {
    return {
      statusCode: 404,
      body: "No recent bill found."
    };
  }

  const data = fs.readFileSync(filePath);
  return {
    statusCode: 200,
    body: data.toString(),
    headers: { "Content-Type": "application/json" }
  };
};
