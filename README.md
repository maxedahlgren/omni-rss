# Omni RSS feed generator

This is a fairly simple tool which scrapes the most recent articles from each of the category feeds from the news aggregation site Omni.se.
I made this since Omni doesn't seem to have an RSS or Atom feed of its own.

## Running

The server and update script can both be managed by pm2 which can be started with `pm2 start ecosystem.config.js`.

`npm run update-rss` runs a script which updates the file `rss.xml`.

`npm run server` starts the server which simply responds with `rss.xml` to all requests.
