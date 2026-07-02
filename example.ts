

import type { DataSource, FetchInput } from "./src/type";
import { SearatesScraperSource, getRates } from "./src/index";

const source: DataSource = new SearatesScraperSource();
// Later (will need to implement the api class function): const source: DataSource = new SearatesApiSource(process.env.SEARATES_API_KEY!);

const Input:FetchInput = {
  origin: "Chennai",
  destination: "Shanghai",
  dispatchDate: "2026-07-17",
  containerType: "20' Standard",
} 

console.log(`\n=== ${Input.origin} → ${Input.destination} (${Input.containerType}) ===`);
console.log("Finding rates...\n");

getRates(source, Input).then((result) => {
  if ("error" in result) {
    console.error("Error:", result.error);
  } else {
    console.table(result);
  }
});