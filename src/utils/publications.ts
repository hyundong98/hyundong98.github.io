import bibliography from "../data/publications.bib?raw";
import venueAliases from "../data/venueAliases.json";
import { parseBibtex, type Publication, type PublicationEntryType } from "./bibtex";

export const publicationTypeLabels: Record<PublicationEntryType, string> = {
  inproceedings: "Conference",
  article: "Journal",
  misc: "Preprint",
  book: "Book Chapter",
};

export const publicationTypeOrder: PublicationEntryType[] = [
  "inproceedings",
  "article",
  "misc",
  "book",
];

function isArxivUrl(url: string | null | undefined): boolean {
  return !!url && /arxiv\.org\/(abs|pdf)\//i.test(url);
}

function hasOfficialPaper(publication: Publication): boolean {
  return !!publication.links.paper && !isArxivUrl(publication.links.paper);
}

type PublicationGroup = {
  entryType: PublicationEntryType;
  label: string;
  items: DisplayPublication[];
};

export type DisplayPublication = Publication & {
  typeLabel: string;
  displayVenue: string;
  displayUrl: string | null;
  displayCode: string | null;
  displayDetails: string;
  displayDate: string;
  toAppear: boolean;
};

const monthAliases: Record<number, string> = {
  1: "Jan.",
  2: "Feb.",
  3: "Mar.",
  4: "Apr.",
  5: "May.",
  6: "Jun.",
  7: "Jul.",
  8: "Aug.",
  9: "Sep.",
  10: "Oct.",
  11: "Nov.",
  12: "Dec.",
};

function getDisplayDate(publication: Publication): string {
  const year = publication.year || "";
  const month = publication.month ? monthAliases[publication.month] : "";

  if (year && month) {
    return `${year} ${month}`;
  }

  return String(year || month);
}

function sortByLatest(a: Publication, b: Publication): number {
  const yearDiff = b.year - a.year;
  if (yearDiff !== 0) return yearDiff;

  const monthDiff = (b.month ?? 0) - (a.month ?? 0);
  if (monthDiff !== 0) return monthDiff;

  return a.title.localeCompare(b.title);
}

function applyVenueAlias(publication: Publication): string {
  const aliases = venueAliases as Record<string, string>;
  const venue = publication.venue;

  if (
    publication.entryType === "inproceedings" ||
    publication.entryType === "article"
  ) {
    return aliases[venue] ?? venue;
  }

  return venue;
}

function getDisplayUrl(publication: Publication): string | null {
  return publication.links.paper ?? publication.links.arxiv ?? null;
}

function toDisplayPublication(publication: Publication): DisplayPublication {
  const displayUrl = getDisplayUrl(publication);

  return {
    ...publication,
    typeLabel: publicationTypeLabels[publication.entryType],
    displayVenue: applyVenueAlias(publication),
    displayUrl,
    displayCode: publication.links.code ?? null,
    displayDetails: getDisplayDetails(publication),
    displayDate: getDisplayDate(publication),
    toAppear:
      (publication.entryType === "inproceedings" ||
        publication.entryType === "article") &&
      !hasOfficialPaper(publication),
  };
}

export const publications: DisplayPublication[] = parseBibtex(bibliography)
  .map(toDisplayPublication)
  .sort(sortByLatest);

export const publicationGroups: PublicationGroup[] = publicationTypeOrder
  .map((entryType) => ({
    entryType,
    label: publicationTypeLabels[entryType],
    items: publications
      .filter((publication) => publication.entryType === entryType)
      .sort(sortByLatest),
  }))
  .filter((group) => group.items.length > 0);

export const selectedPublications: DisplayPublication[] = publications
  .filter((publication) => publication.selected)
  .sort(sortByLatest)
  .slice(0, 5);

function formatPages(pages: string | null | undefined): string | null {
  if (!pages) return null;

  const normalized = pages.replace(/--/g, "–").trim();

  if (!normalized) return null;

  const isRange = normalized.includes("–") || normalized.includes("-");

  return `${isRange ? "pp." : "p."} ${normalized}`;
}

function getDisplayDetails(publication: Publication): string {
  const details: string[] = [];

  if (publication.volume) {
    details.push(`Vol. ${publication.volume}`);
  }

  if (publication.number) {
    details.push(`No. ${publication.number}`);
  }

  const pages = formatPages(publication.pages);
  if (pages) {
    details.push(pages);
  }

  return details.join(", ");
}
