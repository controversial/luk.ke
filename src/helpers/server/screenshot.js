import puppeteer from 'puppeteer';
import chr from 'chrome-aws-lambda';
import { setTimeout } from 'timers/promises';

const MAC_BINARY_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function getChromeLaunchOptions() {
  return process.env.VERCEL
    ? { executablePath: await chr.executablePath, args: chr.args, headless: chr.headless }
    : { executablePath: MAC_BINARY_PATH, headless: false };
}

export default async function screenshot(url, scale = 1, viewport = { width: 1200, height: 627 }) {
  const browser = await puppeteer.launch(await getChromeLaunchOptions());
  const page = await browser.newPage();
  await page.setViewport({ ...viewport, deviceScaleFactor: scale });
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 5000 });
  } catch (e) {}
  await setTimeout(250);
  const file = await page.screenshot();
  await browser.close();
  return file;
}
