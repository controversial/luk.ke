import screenshotUrl from 'helpers/server/screenshot';

const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.BASE_URL;

const screenshot = (path, ...args) => screenshotUrl(new URL(path, base).href, ...args);

export default async function routeHandler(req, res) {
  const path = req.query.path.join('/');
  if (path.startsWith('api/screenshot/')) res.status(400).json({ error: 'recursion not allowed' });
  else {
    res.setHeader('Content-Type', 'image/png');
    const scale = ['1', '2', '3'].includes(req.query.scale) ? parseInt(req.query.scale, 10) : 1;
    res.send(await screenshot(path, scale));
  }
}
