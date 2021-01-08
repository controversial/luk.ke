/* NOTE: In order to make this (dynamically fetched) data available at build-time, we’re using
 *       val-loader, which will treat this module as if it simply held whatever code the async
 *       function resolves to. This system should be moved to getStaticProps if next.js#10949 is
 *       resolved. */

const { getProjects } = require('../../pages/api/content/work/index.js');

// Sequences are ordered collections of pages.
// In the portrait “mobile” layout, they define the order in which pages are laid out horizontally.

module.exports = async function getMobileRouteSequences() {
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
    dependencies: [require.resolve('../../pages/api/content/work/index.js')],
  };
};
