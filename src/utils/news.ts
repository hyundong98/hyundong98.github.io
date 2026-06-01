import newsItems from "../data/news.json";

export type NewsItem = {
  date: string;
  message: string;
};

function isValidDateString(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function formatNewsDate(date: string): string {
  if (!isValidDateString(date)) return date;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export const latestNews: NewsItem[] = (newsItems as NewsItem[])
  .filter((item) => isValidDateString(item.date) && item.message.trim().length > 0)
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 5);