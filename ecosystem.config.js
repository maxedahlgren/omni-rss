export const apps = [
  {
    name: "omni-rss-server",
    script: "npm run server",
  },
  {
    name: "omni-update-rss",
    script: "npm run update-rss",
    cron_restart: "*/10 * * * *",
    autorestart: false,
  },
];
