export type PublicationEntryType =
  | "inproceedings"
  | "article"
  | "misc"
  | "book";

export type PublicationAuthor = {
    name: string;
    me: boolean;
  };
  
  export type PublicationLinks = {
    paper?: string | null;
    arxiv?: string | null;
    code?: string | null;
    project?: string | null;
    demo?: string | null;
    slides?: string | null;
    poster?: string | null;
    openreview?: string | null;
    semantic_scholar?: string | null;
    google_scholar?: string | null;
    dblp?: string | null;
  };
  
  export type Publication = {
    id: string;
    entryType: PublicationEntryType;
    title: string;
    authors: PublicationAuthor[];
    venue: string;
    year: number;
    month: number | null;
    volume: string | null;
    number: string | null;
    pages: string | null;
    accepted: boolean;
    selected: boolean;
    promote: boolean;
    status_override: string | null;
    links: PublicationLinks;
    identifiers: {
      doi?: string | null;
      arxiv?: string | null;
      acl_anthology?: string | null;
      openreview?: string | null;
      dblp?: string | null;
    };
  };
  
  const ME_ALIASES = new Set([
    "hyundong jin",
    "jin, hyundong",
    "현동 진",
    "진현동",
  ]);
  
  function cleanValue(value: string | undefined): string {
    if (!value) return "";
  
    let output = value.trim();
  
    if (
      (output.startsWith("{") && output.endsWith("}")) ||
      (output.startsWith('"') && output.endsWith('"'))
    ) {
      output = output.slice(1, -1);
    }
  
    return output
      .replace(/\\&/g, "&")
      .replace(/\\_/g, "_")
      .replace(/\\%/g, "%")
      .replace(/[{}]/g, "")
      .trim();
  }
  
  function normalizeBoolean(value: string | undefined): boolean {
    return ["true", "yes", "1"].includes(cleanValue(value).toLowerCase());
  }
  
  function splitFields(body: string): Array<[string, string]> {
    const fields: Array<[string, string]> = [];
    let index = 0;
  
    while (index < body.length) {
      while (index < body.length && /[\s,]/.test(body[index])) index += 1;
      if (index >= body.length) break;
  
      const keyStart = index;
      while (index < body.length && /[A-Za-z0-9_:-]/.test(body[index])) index += 1;
      const key = body.slice(keyStart, index).trim().toLowerCase();
  
      while (index < body.length && /\s/.test(body[index])) index += 1;
      if (body[index] !== "=") break;
      index += 1;
      while (index < body.length && /\s/.test(body[index])) index += 1;
  
      const valueStart = index;
      let depth = 0;
      let quoteOpen = false;
  
      while (index < body.length) {
        const char = body[index];
        const previous = body[index - 1];
  
        if (char === '"' && previous !== "\\") quoteOpen = !quoteOpen;
        if (!quoteOpen) {
          if (char === "{") depth += 1;
          if (char === "}") depth -= 1;
          if (char === "," && depth <= 0) break;
        }
  
        index += 1;
      }
  
      const value = body.slice(valueStart, index).trim();
      if (key) fields.push([key, value]);
      if (body[index] === ",") index += 1;
    }
  
    return fields;
  }

  function formatAuthorName(name: string): string {
    const cleaned = name.trim().replace(/\s+/g, " ");
  
    // BibTeX style: "Last, First" or "Last, Jr, First"
    if (cleaned.includes(",")) {
      const parts = cleaned
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
  
      if (parts.length === 2) {
        const [last, first] = parts;
        return `${first} ${last}`.trim();
      }
  
      if (parts.length >= 3) {
        const [last, suffix, ...firstParts] = parts;
        const first = firstParts.join(" ");
        return `${first} ${last} ${suffix}`.trim();
      }
    }
  
    // Already normal style: "First Last"
    return cleaned;
  }
  
  function normalizeAuthorForMatching(name: string): string {
    return formatAuthorName(name).toLowerCase();
  }
  
  function parseAuthors(authorField: string): PublicationAuthor[] {
    return cleanValue(authorField)
      .split(/\s+and\s+/i)
      .map(formatAuthorName)
      .filter(Boolean)
      .map((name) => ({
        name,
        me: ME_ALIASES.has(normalizeAuthorForMatching(name)),
      }));
  }
  
  function getLink(fields: Record<string, string>, key: string): string | null {
    const value = cleanValue(fields[key]);
    return value.length > 0 ? value : null;
  }
  
  function getVenue(fields: Record<string, string>, entryType: string): string {
    if (entryType === "misc") {
      return (
        cleanValue(fields.venue) ||
        cleanValue(fields.archiveprefix) ||
        cleanValue(fields.note) ||
        ""
      );
    }
  
    return (
      cleanValue(fields.venue) ||
      cleanValue(fields.booktitle) ||
      cleanValue(fields.journal) ||
      cleanValue(fields.school) ||
      cleanValue(fields.publisher) ||
      cleanValue(fields.note) ||
      ""
    );
  }
  
  export function parseBibtex(input: string): Publication[] {
    const publications: Publication[] = [];
    const entryPattern = /@(\w+)\s*\{\s*([^,]+)\s*,/g;
    let match: RegExpExecArray | null;
  
    while ((match = entryPattern.exec(input)) !== null) {
      const entryType = match[1].toLowerCase();
      const id = match[2].trim();
      let index = entryPattern.lastIndex;
      let depth = 1;
      let quoteOpen = false;
  
      while (index < input.length && depth > 0) {
        const char = input[index];
        const previous = input[index - 1];
  
        if (char === '"' && previous !== "\\") quoteOpen = !quoteOpen;
        if (!quoteOpen) {
          if (char === "{") depth += 1;
          if (char === "}") depth -= 1;
        }
  
        index += 1;
      }
  
      const body = input.slice(entryPattern.lastIndex, index - 1);
      entryPattern.lastIndex = index;
  
      const fields = Object.fromEntries(splitFields(body));
      const year = Number.parseInt(cleanValue(fields.year), 10);
      const month = Number.parseInt(cleanValue(fields.month), 10);
      const arxivId = getLink(fields, "arxiv") || getLink(fields, "eprint");
      const doi = getLink(fields, "doi");
      const url = getLink(fields, "url");
  
      publications.push({
        id,
        entryType: entryType as PublicationEntryType,
        title: cleanValue(fields.title),
        authors: parseAuthors(fields.author),
        venue: getVenue(fields, entryType),
        year: Number.isFinite(year) ? year : 0,
        month: Number.isFinite(month) ? month : null,
        volume: getLink(fields, "volume"),
        number: getLink(fields, "number"),
        pages: getLink(fields, "pages"),
        accepted: normalizeBoolean(fields.accepted),
        selected: normalizeBoolean(fields.selected),
        promote: normalizeBoolean(fields.promote),
        status_override: cleanValue(fields.status_override) || null,
        links: {
          paper: getLink(fields, "paper") || url || (doi ? `https://doi.org/${doi}` : null),
          arxiv: arxivId ? (arxivId.startsWith("http") ? arxivId : `https://arxiv.org/abs/${arxivId}`) : null,
          code: getLink(fields, "code"),
          project: getLink(fields, "project"),
          demo: getLink(fields, "demo"),
          slides: getLink(fields, "slides"),
          poster: getLink(fields, "poster"),
          openreview: getLink(fields, "openreview"),
          semantic_scholar: getLink(fields, "semantic_scholar"),
          google_scholar: getLink(fields, "google_scholar"),
          dblp: getLink(fields, "dblp"),
        },
        identifiers: {
          doi,
          arxiv: arxivId,
          acl_anthology: getLink(fields, "acl_anthology"),
          openreview: getLink(fields, "openreview"),
          dblp: getLink(fields, "dblp"),
        },
      });
    }
  
    return publications.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  }
  