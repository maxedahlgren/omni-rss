# Omni RSS feed generator

This is a fairly simple tool which scrapes the most recent articles from each of the category feeds from the news aggregation site Omni.se.
I made this since Omni doesn't seem to have an RSS or Atom feed of its own.

DONE:

- scrape articles and collect relevant data
- filter out ads and premium
- access different feeds
- format and write as RSS XML
- test rss is correctly written
- basic server functionality

TODO:

- host online and make it accessible
  - move to docker container
  - cron job for update-rss.js
  - run index.js as server
  - host on aws ecr
