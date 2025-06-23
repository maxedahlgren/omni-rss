import { JSDOM } from "jsdom";
import XMLWriter from "xml-writer";
import fs from "fs";
import http from "http";

import { formatDate } from "./utils.js";

const HOST_URL = "https://omni.se";
const FILEPATH = "rss.xml";

const HOSTNAME = "192.168.0.2";
const PORT = "8080";

const FEED_URLS = [
  "https://omni.se/inrikes",
  "https://omni.se/utrikes",
  "https://omni.se/ekonomi",
  "https://omni.se/politik",
  "https://omni.se/opinion",
  "https://omni.se/sport",
  "https://omni.se/noje-kultur",
  "https://omni.se/tech",

  // premium feeds
  // "https://omni.se/perspektiv-pa-varlden",
  // "https://omni.se/innovation-framtid",
];

// Leaves fields undefined if class is not found
async function getItems(url) {
  const items = [];
  const teasers = [];

  const response = await fetch(url);

  const dom = new JSDOM(await response.text());

  const clusters = dom.window.document.querySelectorAll(
    "[class^='TeaserCluster_clusterContainer']",
  );

  clusters.forEach((cluster) => {
    // hide ads
    // ads include the term native in teaser's className
    if (cluster.className.search("native") != -1) {
      return;
    }
    // skip premium clusters
    if (cluster.className.search("premium") != -1) {
      return;
    }

    teasers.push(
      ...cluster.querySelectorAll("[class^='Teaser_teaserContainer']"),
    );
  });

  teasers.forEach((teaser) => {
    // skip premium articles
    if (!!teaser.querySelector("[class*='TeaserFooter_premium'")) {
      return;
    }

    const path = teaser
      .querySelector("[class^='Teaser_teaser_'")
      ?.querySelector("a")?.href;
    const link = HOST_URL + path;

    const title = teaser.querySelector("h2")?.innerHTML;
    const description = teaser.querySelector(
      "[class^='TeaserText_teaserText']",
    )?.innerHTML;

    const dateTime = teaser.querySelector("time")?.dateTime;
    const pubDate = dateTime ? formatDate(new Date(dateTime)) : undefined;

    let imageURL;
    if (teaser.querySelector("img")) {
      imageURL = new URL(teaser.querySelector("img").src);

      // overwrite url query params to ensure thumbnail image
      imageURL.searchParams.set("h", "180");
      imageURL.searchParams.set("w", "180");
    }
    const imgSrc = imageURL.href ?? undefined;

    if (!imgSrc) {
      console.log(link);
    }

    items.push({ link, title, description, pubDate, imgSrc, dateTime });
  });

  console.log(url + ", " + items.length);

  return items;
}

// Leaves out fields if undefined
function writeItem(writer, { link, title, description, pubDate, imgSrc }) {
  writer.startElement("item");

  if (link) {
    writer.startElement("guid").text(link).endElement();
    writer.startElement("link").text(link).endElement();
  }
  if (title) {
    writer.startElement("title").text(title).endElement();
  }
  if (description) {
    writer.startElement("description").text(description).endElement();
  }
  if (pubDate) {
    writer.startElement("pubDate").text(pubDate).endElement();
  }
  if (imgSrc) {
    writer
      .startElement("enclosure")
      .writeAttribute("url", imgSrc)
      .writeAttribute("type", "image/jpeg")
      .endElement();
  }

  writer.endElement();
}

function writeXML(items) {
  const writeStream = fs.createWriteStream(FILEPATH);

  const writer = new XMLWriter(true, function (string, encoding) {
    writeStream.write(string, encoding);
  });

  writer.startElement("rss").writeAttribute("version", "2.0");

  writer.startElement("channel");
  writer.startElement("title").text("Omni").endElement();
  writer.startElement("link").text(HOST_URL).endElement();
  writer.startElement("description").endElement();

  items.forEach((item) => {
    writeItem(writer, item);
  });

  writer.endElement();
  writer.endElement();

  writeStream.end();
}

Promise.all(FEED_URLS.map((url) => getItems(url)))
  .then((feeds) => {
    const items = [].concat(...feeds);

    items.sort((a, b) =>
      a.dateTime < b.dateTime ? 1 : a.dateTime > b.dateTime ? -1 : 0,
    );

    console.log("got " + items.length + " articles");

    writeXML(items);
  })
  .catch((error) => {
    throw error;
  });

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
server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
