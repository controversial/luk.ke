import puppeteer from 'puppeteer-core';
import chr from 'chrome-aws-lambda';

const MAC_BINARY_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function getChromeLaunchOptions() {
  return process.env.VERCEL
    ? { executablePath: await chr.executablePath, args: chr.args, headless: chr.headless }
    : { executablePath: MAC_BINARY_PATH };
}

export async function screenshot(path, scale = 1, viewport = { width: 1200, height: 627 }) {
  const browser = await puppeteer.launch(await getChromeLaunchOptions());
  const page = await browser.newPage();
  await page.setViewport({ ...viewport, deviceScaleFactor: scale });
  await page.goto(new URL(path, process.env.BASE_URL).href, { waitUntil: 'networkidle2', timeout: 5000 });
  const file = await page.screenshot();
  await browser.close();
  return file;
}

export default async function routeHandler(req, res) {
  const path = req.query.path.join('/');
  if (path.startsWith('api/screenshot/')) res.status(400).json({ error: 'recursion not allowed' });
  else {
    res.setHeader('Content-Type', 'image/png');
    const scale = ['1', '2', '3'].includes(req.query.scale) ? parseInt(req.query.scale, 10) : 1;
    res.send(await screenshot(path, scale));
  }
}
