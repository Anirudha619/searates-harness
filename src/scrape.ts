import "dotenv/config";
import { chromium, type Page } from "playwright";
import { SEARATES_SELECTORS } from "./selectors";
import type { RateCard } from "./type";

async function extractRates(page: Page): Promise<RateCard[]> {
  const buttons = page.locator(SEARATES_SELECTORS.rateButton);
  const count = await buttons.count();
  const results: RateCard[] = [];

  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    const rateId = await button.getAttribute('data-rateid');

    const card = button.locator(SEARATES_SELECTORS.cardFromButton);

    const [carrier, text] = await Promise.all([
      card.locator(SEARATES_SELECTORS.carrierLogo).first().getAttribute('alt'),
      card.innerText(),
    ]);

    results.push(parseRateCard(rateId!, carrier, text));
  }

  return results;
}

function parseRateCard(rateId: string, carrier: string | null, text: string): RateCard {
  const normalized = text.normalize('NFKC').replace(/\u00A0/g, ' ');
  const lines = normalized.split('\n').map(l => l.trim()).filter(Boolean);
  const find = (re: RegExp) => lines.find(l => re.test(l)) ?? null;

  const priceLine = find(/^[A-Z]{3}\s+[\d\s,.]+$/);
  let currency: string | null = null;
  let price: number | null = null;
  if (priceLine) {
    const m = priceLine.match(/^([A-Z]{3})\s+([\d\s,.]+)$/)!;
    currency = m[1];
    price = parseFloat(m[2].replace(/[\s,]/g, ''));
  }

  const containerType = find(/^\d{2}'[A-Z]{2,5}$/);

  const transitLine = find(/^\d+\s*days?$/i);
  const transitTimeDays = transitLine ? parseInt(transitLine, 10) : null;

  const missing: string[] = [];
  if (!currency || price === null) missing.push('price/currency');
  if (!containerType) missing.push('containerType');
  if (transitTimeDays === null) missing.push('transitTimeDays');
  if (!carrier) missing.push('carrier');
  if (missing.length) console.warn(`[rate ${rateId}] missing: ${missing.join(', ')}`, normalized);

  return { rateId, carrier, price, currency, containerType, transitTimeDays };
}

// The only exported entry point: give it a URL, get back rate cards.
// Browser lifecycle lives and dies inside this function — nothing outside
// this file needs to know Playwright is involved.
export async function scrapeSearatesUrl(url: string): Promise<RateCard[]> {
  const userDataDir = process.env.CHROME_USER_DATA_DIR || "C:\\Users\\admin\\AppData\\Local\\Google\\Chrome\\User Data";
  const context = await chromium.launchPersistentContext(
    userDataDir,
    {
      channel: "chrome",
      headless: true,
      args: ["--profile-directory=Person 1", "--disable-blink-features=AutomationControlled"],
    }
  );

  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    return await extractRates(page);
  } finally {
    await context.close();
  }
}