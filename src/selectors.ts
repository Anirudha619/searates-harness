// All markup-dependent selectors for the SeaRates logistics-explorer page,
// in one place. If SeaRates changes their DOM, this is the only file that
// should need to change.

export const SEARATES_SELECTORS = {
  // Each rate card's "buy" button — carries the rate id.
  rateButton: "[data-rateid]",

  // From a rate button, the ancestor card containing the carrier logo.
  // Kept as a function since it's relative to a locator, not a bare string.
  cardFromButton: 'xpath=ancestor::div[.//img[@alt]][1]',

  // Carrier logo within a card — its alt text is the carrier name.
  carrierLogo: "img[alt]",
} as const;