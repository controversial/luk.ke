const Prismic = require('prismic-javascript');

export const apiEndpoint = process?.env?.PRISMIC_ENDPOINT || 'https://luke.prismic.io/api/v2';

export default function initApi(req) {
  return Prismic.getApi(apiEndpoint, { req });
}
