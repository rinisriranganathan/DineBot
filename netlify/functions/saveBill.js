const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const bill = JSON.parse(event.body);

  const filePath = path.join("/tmp", `latest.json`);
  fs.writeFileSync(filePath, JSON.stringify(bill, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      billUrl: "/view-bill"
    }),
    headers: {
      "Content-Type": "application/json"
    }
  };
};
