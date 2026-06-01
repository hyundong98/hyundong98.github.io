import { execSync } from "node:child_process";

export function getLastCommitDate(): string {
  try {
    return execSync("git log -1 --format=%cs", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function formatCommitDate(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}