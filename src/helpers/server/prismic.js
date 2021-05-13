const Prismic = require('prismic-javascript');
const apiEndpoint = (typeof process !== 'undefined' && process.env.PRISMIC_ENDPOINT) || 'https://luke.prismic.io/api/v2';
const Api = Prismic.api(apiEndpoint);


/* Extract filename if image comes from imgix - Next.js can do smart optimizations with this. */

const unpackDimensions = ({ width, height } = {}) => [width, height];
function imageSrc(url) {
  let u = {};
  try { u = new URL(url); } catch (e) { /* Ignore URL parsing errors */ }
  if (u.host === 'images.prismic.io' && u.pathname.startsWith('/luke')) {
    return {
      src: url,
      filename: u.pathname.split('/').slice(-1)[0],
    };
  }
  return { src: url };
}

const cleanImage = ({ url, dimensions, alt } = {}) => (url || dimensions || alt || null) && {
  ...imageSrc(url),
  alt,
  dimensions: unpackDimensions(dimensions),
};

module.exports = {
  Api,
  apiEndpoint,
  cleanImage,
};
