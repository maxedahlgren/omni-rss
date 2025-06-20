import { JSDOM } from "jsdom";

const URL = "https://omni.se/senaste";

// DONE
// scrape articles and collect relevant data
// filter out ads and premium

// TODO
// format and write as RSS XML
// get more articles (up to a given date or given number of articles?)

async function getItems() {
  const items = [];
  const teasers = [];

  const response = await fetch(URL);

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

    teasers.push(...cluster.querySelectorAll("[class^='Teaser_teaserContainer']"));
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

  return items;
}

const items = await getItems();

console.log("got " + items.length + " items");
items.forEach((item) => {
  console.log(
    item.guid?.substring(0, 10),
    item.title?.substring(0, 10),
    item.description?.substring(0, 10),
    item.pubDate,
  );
});
