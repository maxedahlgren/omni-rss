import { JSDOM } from "jsdom";

const FEED_URLS = [
  "https://omni.se/inrikes",
  "https://omni.se/utrikes",
  "https://omni.se/ekonomi",
  "https://omni.se/politik",
  "https://omni.se/opinion",
  // "https://omni.se/sport",
  "https://omni.se/noje-kultur",
  "https://omni.se/tech",
  // "https://omni.se/perspektiv-pa-varlden",
  // "https://omni.se/innovation-framtid",
];

// DONE
// scrape articles and collect relevant data
// filter out ads and premium
// access different feeds

// TODO
// format and write as RSS XML

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

    const guid = teaser
      .querySelector("[class^='Teaser_teaser_'")
      ?.querySelector("a")?.href;
    const title = teaser.querySelector("h2")?.innerHTML;
    const description = teaser.querySelector(
      "[class^='TeaserText_teaserText']",
    )?.innerHTML;
    const pubDate = teaser.querySelector("time")?.dateTime;
    const imgSrc = teaser.querySelector("img").src;

    items.push({ guid, title, description, pubDate, imgSrc });
  });

  console.log(url + ", " + items.length);

  return items;
}

Promise.all(FEED_URLS.map((url) => getItems(url))).then((feeds) => {
  const items = [].concat(...feeds);

  items.sort((a, b) =>
    a.pubDate < b.pubDate ? 1 : a.pubDate > b.pubDate ? -1 : 0,
  );

  console.log("got " + items.length + " articles");

  // items.forEach((item) => {
  //   console.log(
  //     item.guid?.substring(0, 10),
  //     item.title?.substring(0, 10),
  //     item.description?.substring(0, 10),
  //     item.pubDate,
  //   );
  // });
});
