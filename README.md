# Omni RSS feed generator

This is a fairly simple tool which scrapes the most recent articles from each of the category feeds from the news aggregation site Omni.se.
I made this since Omni doesn't seem to have an RSS or Atom feed of its own.

## Running

`npm run update-rss` runs a script which updates the file `rss.xml`.

`npm run server` starts the server which responds with the xml file at the path `/rss` after updating it if necessary.

## Rewrite using XSL and Atom

### Done

- XML basics
- Run using php
- Single feed

### TODO

- Thumbnail integration
- Combine all feeds
