import { execSync } from "child_process";
import fs from "fs";
import http from "http";

import { FILEPATH } from "./utils.js";

const { HOST = "localhost", PORT = 8080 } = process.env;

// Amount of time to have elapsed before feed should be refreshed (in ms)
const REFRESH_TIME = 600000; // 10 * 60 * 1000

/**
 * Writes the contents of the XML file to the response.
 * If the XML file is older than REFRESH_TIME, updates it before sending.
 * @param {http.ServerResponse} response
 */
function sendXML(response) {
  const stat = fs.statSync(FILEPATH, { throwIfNoEntry: false });

  if (!stat || new Date() - stat.mtime > REFRESH_TIME) {
    console.log("updating rss");

    // Could have error handling here, for now trusting pm2 to restart server
    // and log and failed request should let me know something went wrong
    execSync("npm run update-rss");

    console.log("rss updated");
  }

  response.writeHead(200, {
    "Content-Type": "application/xml; charset=utf-8",
    "Content-Length": fs.statSync(FILEPATH).size,
  });

  const readStream = fs.createReadStream(FILEPATH);
  readStream.pipe(response);
}

/** @param {http.ServerResponse} response */
function badRequest(response) {
  response.end("404");
}

const server = http.createServer((request, response) => {
  console.log(`${new Date().toISOString()} received request`);
  switch (request.url) {
    case "/rss":
      sendXML(response);
      break;
    default:
      badRequest(response);
      break;
  }
});

// Start the server and listen on the specified port
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
