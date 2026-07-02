import type { DataSource } from "../src/type";
import { SearatesScraperSource, getRates } from "../src/index";
import testcases from "./testcases";

const source: DataSource = new SearatesScraperSource();

async function runAll() {
  for (const tc of testcases) {
    console.log(`\n=== ${tc.origin} → ${tc.destination} (${tc.containerType}) ===`);
    const result = await getRates(source, tc);
    console.table(result);
  }
}

runAll();
