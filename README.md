# SeaRates Harness

Retrieve freight rates from SeaRates with a swappable data source.

> ⚠️ Heads up: the assignment asked for a **Python** module and for **vessel
> schedules + rates**. This is **TypeScript**, and only **rates** are
> implemented (no schedules).

---

## Prerequisites

1. **Install Chrome** if you don't have it already.
2. **Log into searates.com** manually in your Chrome profile. The scraper reuses your browser session — it won't log in for you (auto-login was intentionally kept out of scope, but could be added easily).

## Environment

Set your Chrome profile path in `.env`:

```env
CHROME_USER_DATA_DIR=C:\Users\admin\AppData\Local\Google\Chrome\User Data
```

The scraper launches Chrome from this profile so it has access to your logged-in SeaRates session.

## Installation

```bash
npm install
npx playwright install chromium
```

## Run the Example

```bash
npx tsx example.ts
```

## Run Tests (basic example testcase runner)

```bash
npx tsx test/run.ts
```

## Usage

The harness exports a single `getRates` function. Pass it a data source and an input object:

```ts
import type { DataSource, FetchInput } from "./src/type";
import { SearatesScraperSource, getRates } from "./src/index";

const source: DataSource = new SearatesScraperSource();
// Later (will need to implement the api class function): const source: DataSource = new SearatesApiSource(process.env.SEARATES_API_KEY!);

const Input:FetchInput = {
  origin: "mumbai",
  destination: "Shanghai",
  dispatchDate: "2026-07-5",
  containerType: "20' Standard",
} 

getRates(source, Input).then((result) => {
  if ("error" in result) {
    console.error("Error:", result.error);
  } else {
    console.table(result);
  }
});
```

Inputs are normalized automatically — ports accept names or UN/LOCODES (INNSA, NLRTM), container types accept `20`, `20ft`, `ST20`, `20 standard`, etc.

### Swappable Data Source

`getRates` accepts any object implementing the `DataSource` interface:

```ts
interface DataSource {
  getRates(query: NormalizedQuery): Promise<RateCard[]>;
}
```

Switching from scraper to the future API is one line:

```ts
// Current — browser automation
const source: DataSource = new SearatesScraperSource();

// Future — official SeaRates REST API
const source: DataSource = new SearatesApiSource(process.env.SEARATES_API_KEY!);
```

The harness, data shapes (`RateCard`, `FetchInput`, `NormalizedQuery`), and output format never change.

---

## Project Structure

```
src/
  index.ts         getRates(), SearatesScraperSource, SearatesApiSource
  type.ts          shared types (Port, ContainerType, RateCard, FetchInput, etc.)
  scrape.ts        Playwright browser automation
  selectors.ts     all SeaRates DOM selectors in one file
  normalize/       fuzzy port & container type matchers
  static/          reference port and container data
test/
  testcases.ts     input test cases
  run.ts           test runner
```

---

## Design Decisions


**Selector centralization**: All DOM selectors live in `src/selectors.ts`. When SeaRates changes their markup, a future engineer fixes everything in that one file.

**Input normalization**:
Container type normalization: Clean up the input string, pull out the container size (20/40/etc) and family keyword (HC, OT, standard, etc), then look up that size-family combo against a pre-built index of known container types. Returns undefined if no size is found or no matching type exists.

Port normalization: Try to match a UN/LOCODE pattern first, then fall back to an exact name match, then a fuzzy name match if neither works. Returns undefined if nothing clears the fuzzy-match threshold.

## Known Limitations

- **Manual SeaRates login required** — you must log into searates.com in your Chrome profile before running. Auto-login was kept out of scope but is straightforward to add.
- Only FCL container types are supported
- No caching — every call hits SeaRates

---