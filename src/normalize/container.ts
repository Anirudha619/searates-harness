import type{ContainerType} from '../type'
import containerTypes from '../static/container'

/**
 * Maps normalized key -> ContainerType
 *
 * Example keys:
 * 20-standard
 * 40-high cube
 * 20-open top
 */
const containerIndex = new Map<string, ContainerType>();

buildContainerIndex();

function buildContainerIndex(): void {
  for (const container of containerTypes) {
    const key = buildKey(container.name);
    containerIndex.set(key, container);
  }
}

export function findContainerType(
  input: string
): ContainerType | undefined {
  const key = parseInput(input);

  if (!key) {
    return undefined;
  }

  return containerIndex.get(key);
}

/**
 * Converts
 * "20' Standard"
 *
 * into
 *
 * "20-standard"
 */
function buildKey(name: string): string {
  const normalized = normalize(name);

  const size = extractSize(normalized);
  const family = extractFamily(normalized);

  return `${size}-${family}`;
}

/**
 * Converts user input into the same key.
 *
 * Examples:
 *
 * 20
 * 20ft
 * 20'
 * ST20
 * 20 standard
 * 20 st
 * Standard 20
 *
 * =>
 *
 * 20-standard
 */
function parseInput(input: string): string | null {
  const normalized = normalize(input);

  const size = extractSize(normalized);
  if (!size) {
    return null;
  }

  const family = extractFamily(normalized);

  return `${size}-${family}`;
}

function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSize(text: string): string | null {
  const match = text.match(/\b(10|20|40|45|48|53)(?:ft)?\b/);

  if (match) {
    return match[1];
  }

  const codeMatch = text.match(/(10|20|40|45|48|53)/);

  return codeMatch?.[1] ?? null;
}

function extractFamily(text: string): string {
  if (/\bhcpw\b|high cube pallet wide/.test(text))
    return "high cube pallet wide";

  if (/\bpw\b|pallet wide/.test(text))
    return "pallet wide";

  if (/\bflc\b|flatrack collapsible/.test(text))
    return "flatrack collapsible";

  if (/\bhc\b|high cube/.test(text))
    return "high cube";

  if (/\bref\b|refrigerated/.test(text))
    return "refrigerated";

  if (/\bot\b|open top/.test(text))
    return "open top";

  if (/\bfl\b|flatrack/.test(text))
    return "flatrack";

  if (/\bpl\b|platform/.test(text))
    return "platform";

  if (/\bta\b|\btg\b|tank/.test(text))
    return "tank";

  if (/\bbu\b|\bbk\b|bulk/.test(text))
    return "bulk";

  // Default
  return "standard";
}

// ---------------------------------------
// Examples
// ---------------------------------------

const tests = [
  "20",
  "20ft",
  "20'",
  "20 standard",
  "Standard 20",
  "ST20",
  "20 ST",
  "40 HC",
  "HC40",
  "40 High Cube",
  "REF20",
  "20 Refrigerated",
  "20 OT",
  "Open Top 20",
  "20 FLC",
  "45 HCPW",
];

// for (const test of tests) {
//   console.log(test, "=>", findContainerType(test)?.code);
// }