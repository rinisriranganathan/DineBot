const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const bill = JSON.parse(event.body);
  const id = Date.now().toString(); // unique ID based on timestamp

  const filePath = path.join("/tmp", `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(bill, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      billUrl: `https://your-site.netlify.app/view-bill?id=${id}`,
    }),
  };
};