/* NOTE: In order to make this (dynamically fetched) data available at build-time, we’re using
 *       val-loader, which will treat this module as if it simply held whatever code the async
 *       function resolves to. This system should be moved to getStaticProps if next.js#10949 is
 *       resolved. */

// This includes a lot of hacks for compatibility with Node 12
// All the babel stuff should be replaced by a normal require once Node 14+ ships on Vercel

const nextBabelLoader = require('next/dist/build/webpack/loaders/next-babel-loader').default;
const fs = require('fs').promises;
const path = require('path');

const Module = require('module');


async function babelRequire(modulePath) {
  const abspath = require.resolve(modulePath);
  const moduleCode = await fs.readFile(abspath, 'utf-8');

  // Hack together something that looks enough like a Webpack interface that it will run the loader
  const babelifiedModuleCode = await new Promise((resolve, reject) => {
    const webpack = {
      async: () => (err, val) => {
        if (err) reject(err);
        else resolve(val);
      },
      query: { cwd: __dirname, babelPresetPlugins: [] },
      resourcePath: abspath,
      emitWarning: console.warn,
      addDependency: () => {},
      compile: nextBabelLoader,
    };
    webpack.compile(moduleCode);
  });
  const newModule = new Module(abspath, module);
  newModule.paths = Module._nodeModulePaths(path.dirname(abspath));
  newModule.filename = abspath;
  newModule._compile(babelifiedModuleCode, abspath);
  return newModule.exports;
}

// const { getProjects } = require('../../pages/api/content/work/index.js');

// Sequences are ordered collections of pages.
// In the portrait “mobile” layout, they define the order in which pages are laid out horizontally.

module.exports = async function getMobileRouteSequences() {
  const workContentModulePath = '../../pages/api/content/work/index.js';
  const { getProjects } = await babelRequire(workContentModulePath);

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
    dependencies: [require.resolve(workContentModulePath)],
  };
};

// Allow running with 'node sequences.js' in testing
if (!module.parent) {
  module.exports().then(console.log);
}
