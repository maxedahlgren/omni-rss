import fs from "fs";
import http from "http";

import { FILEPATH } from "./utils.js";

const { PORT, HOST } = process.env;

const server = http.createServer((request, response) => {
  const stat = fs.statSync(FILEPATH);

  console.log(
    `${new Date().toISOString()} Request from ${request.socket.remoteAddress}`,
  );

  // Set the response HTTP header with HTTP status and Content type
  response.writeHead(200, {
    "Content-Type": "application/xml; charset=utf-8",
    "Content-Length": stat.size,
  });

  const readStream = fs.createReadStream(FILEPATH);
  readStream.pipe(response);
});

// Start the server and listen on the specified port
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
