const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const id = event.queryStringParameters.id;
  const filePath = path.join("/tmp", `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return { statusCode: 404, body: "Not found" };
  }

  const data = fs.readFileSync(filePath);
  return {
    statusCode: 200,
    body: data.toString(),
    headers: { "Content-Type": "application/json" },
  };
};