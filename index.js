import { JSDOM } from "jsdom";
import XMLWriter from "xml-writer";
import fs from "fs";
import { formatDate } from "./utils.js";

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

    // TODO: currently fails silently leaving field undefined if an element 
    // (apart from date) isn't found. Could be handled better
    const path = teaser
      .querySelector("[class^='Teaser_teaser_'")
      ?.querySelector("a")?.href;
    const guid = HOST_URL + path;

    const title = teaser.querySelector("h2")?.innerHTML;
    const description = teaser.querySelector(
      "[class^='TeaserText_teaserText']",
    )?.innerHTML;

    const date = teaser.querySelector("time")?.dateTime;
    const pubDate = date ? formatDate(new Date(date)) : undefined;

    // TODO: '&' in search params seems to be written '&amp;'
    // unsure yet if this will cause issues
    const imageURL = new URL(teaser.querySelector("img").src);

    // overwrite url query params to ensure thumbnail image
    imageURL.searchParams.set("h", "180");
    imageURL.searchParams.set("w", "180");
    const imgSrc = imageURL.href;

    items.push({ guid, title, description, pubDate, imgSrc });
  });

  console.log(url + ", " + items.length);

  return items;
}

function writeItem(writer, { guid, title, description, pubDate, imgSrc }) {
  writer.startElement("item");

  writer.startElement("guid").text(guid).endElement();
  writer.startElement("link").text(guid).endElement();
  writer.startElement("title").text(title).endElement();
  writer.startElement("description").text(description).endElement();
  if (pubDate) {
    writer.startElement("pubDate").text(pubDate).endElement();
  }
  writer.startElement("media:content")
    .writeAttribute("width", "180")
    .writeAttribute("url", imgSrc).endElement();

  writer.endElement();
}

function writeXML(items) {
  const writeStream = fs.createWriteStream('rss.xml');

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
      a.pubDate < b.pubDate ? 1 : a.pubDate > b.pubDate ? -1 : 0,
    );

    console.log("got " + items.length + " articles");

    writeXML(items);
  })
  .catch((error) => {
    throw error;
  });
