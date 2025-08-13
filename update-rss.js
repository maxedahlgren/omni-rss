import { JSDOM } from "jsdom";
import XMLWriter from "xml-writer";
import fs from "fs";

import { formatDate, FILEPATH } from "./utils.js";

/**
 * @typedef {Object} Item An article item used for writing XML
 * @property {string} link
 * @property {string} title
 * @property {string=} description
 * @property {string} pubDate rss formatted pubDate (RFC822)
 * @property {string} imgSrc link to thumbnail image
 * @property {string} dateTime date value retrieved from article
 */

const HOST_URL = "https://omni.se";

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

/**
 * Leaves fields undefined if class is not found
 * @param {string} url
 * @returns {Item[]} List of rss Items
 */
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

    const title = teaser.querySelector("h2")?.textContent;
    const description = teaser.querySelector(
      "[class^='TeaserText_teaserText']",
    )?.textContent;

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

  console.log(`${url}, ${items.length} items`);

  return items;
}

/**
 * Leaves out fields if undefined
 * @param {XMLWriter} writer
 * @param {Item} item
 */
function writeItemXML(writer, { link, title, description, pubDate, imgSrc }) {
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

/**
 * Writes items to an XML file
 * @param {Item[]} items
 */
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
    writeItemXML(writer, item);
  });

  writer.endElement();
  writer.endElement();

  writeStream.end();
}

// Does not catch errors
async function updateRSS() {
  const feeds = await Promise.all(FEED_URLS.map((url) => getItems(url)));
  const items = feeds.flat();
  items.sort((a, b) =>
    a.dateTime < b.dateTime ? 1 : a.dateTime > b.dateTime ? -1 : 0,
  );
  console.log(`got ${items.length} articles`);
  writeXML(items);
}

updateRSS();
