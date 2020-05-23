const Prismic = require('prismic-javascript');

export const apiEndpoint = process?.env?.PRISMIC_ENDPOINT || 'https://luke.prismic.io/api/v2';

export default Prismic.api(apiEndpoint);
