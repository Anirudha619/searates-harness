import { findPort } from "./normalize/ports";
import { findContainerType } from "./normalize/container";
import { scrapeSearatesUrl } from "./scrape";
import type { FetchInput, NormalizedQuery, DataSource, RateCard } from "./type";

function normalizeString(input: string): string {
  return input.replace(/,/g, "").replace(/ /g, "-");
}

function normalizeQuery(input: FetchInput): NormalizedQuery | null {
  const originPort = findPort(input.origin);
  const destinationPort = findPort(input.destination);
  const container = findContainerType(input.containerType);

  if (!originPort || !destinationPort || !container) return null;

  return { originPort, destinationPort, container, dispatchDate: input.dispatchDate };
}

// ---------------------------------------------------------------------------
//  IMPLEMENTATION #1 — scraping. Builds the URL, hands off to the scraper
//    module for the actual browser work. This class knows nothing about
//    Playwright — that's `searatesScraper.ts`'s job.
// ---------------------------------------------------------------------------

export class SearatesScraperSource implements DataSource {
  async getRates(query: NormalizedQuery): Promise<RateCard[]> {
    const url = this.buildUrl(query);
    return scrapeSearatesUrl(url);
  }

  private buildUrl(query: NormalizedQuery): string {
    const { originPort, destinationPort, container, dispatchDate } = query;
    const from = normalizeString(originPort!.name) + "-" + normalizeString(originPort!.countryCode);
    const to = normalizeString(destinationPort!.name) + "-" + normalizeString(destinationPort!.countryCode);
    const route = `from-${from}-to-${to}`;

    const params = new URLSearchParams({
      from,
      to,
      fromId: originPort!.id,
      toId: destinationPort!.id,
      date: dispatchDate,
      type: "FCL",
      container: container!.code,
    });

    return `https://www.searates.com/logistics-explorer/${route}/?${params.toString()}`;
  }
}

// ---------------------------------------------------------------------------
//  IMPLEMENTATION #2 — future official API. Same interface, same
//    NormalizedQuery in, same RateCard[] out. Still just a stub.
// ---------------------------------------------------------------------------

export class SearatesApiSource implements DataSource {
  constructor(private apiKey: string) {}

  async getRates(query: NormalizedQuery): Promise<RateCard[]> {
    throw new Error("Not implemented yet — swap in once we have API access");
    // Eventually:
    // const res = await fetch("https://api.searates.com/rates", {
    //   headers: { Authorization: `Bearer ${this.apiKey}` },
    //   body: JSON.stringify({ ... }),
    // });
    // const json = await res.json();
    // return json.items.map(toRateCard); // map API's shape -> RateCard
  }
}

// ---------------------------------------------------------------------------
// THE HARNESS — depends only on DataSource. Doesn't change when we swap.
// ---------------------------------------------------------------------------

export async function getRates(source: DataSource, input: FetchInput): Promise<RateCard[] | { error: string }> {
  const query = normalizeQuery(input);
  if (!query) return { error: "Could not resolve one or more inputs" };
  try {
    return await source.getRates(query);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ---------------------------------------------------------------------------
//  THE SWAP — one line at the call site.
// ---------------------------------------------------------------------------

const source: DataSource = new SearatesScraperSource();
// Later: const source: DataSource = new SearatesApiSource(process.env.SEARATES_API_KEY!);

// example usage
// getRates(source, {
//   origin: "Chennai",
//   destination: "Shanghai",
//   dispatchDate: "2026-07-15",
//   containerType: "20' Standard",
// }).then((result) => console.table(result));