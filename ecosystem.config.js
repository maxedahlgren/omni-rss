export const apps = [
  {
    name: "omni-rss-server",
    script: "npm run server",
  },
  {
    name: "update-rss",
    script: "npm run update-rss",
    cron_restart: "0 * * * *",
    autorestart: false,
  },
];
