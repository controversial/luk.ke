import fs from 'fs/promises';
import path from 'path';
import glob from 'globby';
import { SitemapStream, streamToPromise } from 'sitemap';

import { fileURLToPath } from 'url';
import { argv } from 'process';

const PUBLIC_BASE = 'https://luk.ke/';


export const getPaths = () => glob('**/*.html', { cwd: '.next/server/pages', onlyFiles: true })
  .then((paths) => paths.map(((p) => {
    // Remove .html extensions and remove "index.html" filenames from the ends of paths
    const { dir, name } = path.parse(p);
    return `/${name === 'index' ? dir : path.join(dir, name)}`;
  })))
  .then((paths) => paths.sort());

export async function getSitemap() {
  const paths = await getPaths();
  const sitemapStream = new SitemapStream({ hostname: PUBLIC_BASE });
  paths.forEach((p) => sitemapStream.write(p));
  sitemapStream.end();
  return (await streamToPromise(sitemapStream)).toString();
}


if (fileURLToPath(import.meta.url) === argv[1]) {
  const sitemap = await getSitemap();
  await fs.writeFile('public/sitemap.xml', sitemap, 'utf-8');
}
