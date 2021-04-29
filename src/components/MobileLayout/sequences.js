/* NOTE: In order to make this (dynamically fetched) data available at build-time, we’re using
 *       val-loader, which will treat this module as if it simply held whatever code the async
 *       function resolves to. This system should be moved to getStaticProps if next.js#10949 is
 *       resolved. */

// This includes a lot of hacks for compatibility with Node 12
// All the babel stuff should be replaced by a normal require once Node 14+ ships on Vercel

import { getProjects } from '../../pages/api/content/work/index.js';
// required to do dependency dance before import.meta.url is stable
import path from 'path';
import { fileURLToPath } from 'url';

// Sequences are ordered collections of pages.
// In the portrait “mobile” layout, they define the order in which pages are laid out horizontally.

export default async function getMobileRouteSequences() {
  const sequences = [
    // Default sequence of “main” pages
    [
      { title: 'Hello', href: '/' },
      { title: 'Work', href: '/work' },
      { title: 'Contact', href: '/contact' },
    ],
    // Alternate sequence: case study pages
    (await getProjects()).map(({ name, uid }) => ({
      title: name,
      href: '/work/[project]',
      as: `/work/${uid}`,
    })),
  ];


  return {
    code: `module.exports = ${JSON.stringify(sequences)};`,
    dependencies: [
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../pages/api/content/work/index.js',
      ),
    ],
  };
}

// eslint-disable-next-line no-console
getMobileRouteSequences().then(console.log);
