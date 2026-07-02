import { search } from "fast-fuzzy";
import type {Port} from '../type'
import ports from '../static/ports'

const nameIndex = new Map<string, number>();
const unlocodeIndex = new Map<string, number[]>();

buildIndexes();

function buildIndexes(): void {
  ports.forEach((port, index) => {
    nameIndex.set(normalize(port.name), index);

    const key = port.unlocode.toUpperCase();

    if (!unlocodeIndex.has(key)) {
      unlocodeIndex.set(key, []);
    }

    unlocodeIndex.get(key)!.push(index);
  });
}

export function findPort(input: string): Port | undefined{
  // Stage 1: UN/LOCODE
  const unlocode = extractUnlocode(input);
  // console.log(unlocode)

  if (unlocode) {
    const index = unlocodeIndex.get(unlocode);
    // console.log(index)

    if (index !== undefined) {
      if(index.length == 1){

        return ports[index[0]];
      }
    }
  }

  // Stage 2: Normalize
  const normalized = normalize(input);

  // Stage 3: Exact lookup
  const index = nameIndex.get(normalized);

  if (index !== undefined) {
    return ports[index];
  }


  // Stage 4: Fuzzy lookup
  const searchable = ports.flatMap((port) => [
    {
      value: normalize(port.name),
      port,
    },
    {
      value: port.unlocode.toUpperCase(),
      port,
    },
  ]);

  const match = search(
    normalized.toUpperCase(),
    searchable.map((x) => x.value),
    {
      returnMatchData: true,
      threshold: 0.75,
    }
  )[0];

  if (!match) {
    return undefined;
  }

  return searchable.find((x) => x.value === match.original)?.port;

//   return ports[match.match.index - 1];
}

function extractUnlocode(text: string): string | null {
  const match = text
    .toUpperCase()
    .match(/\b[A-Z]{2}[A-Z0-9]{3}\b/);

  return match?.[0] ?? null;
}

function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ------------------------
// Example
// ------------------------

const tests = [
//   "INNSA",
//   "Nhava Sheva",
  // "INNSA",
  "nhava seva",
  // "Roterdam",
//   "NLRTM",
//   "Singapore",
//   "SGSIN",
];

// for (const test of tests) {
//   console.log(test, "=>", findPort(test));
// }