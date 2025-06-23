const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
});

export const FILEPATH = "rss.xml";

// Writes a date in format required (RFC822)
export function formatDate(date) {
  return dateFormat.format(date) + " " + timeFormat.format(date);
}
