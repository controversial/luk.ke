/* eslint-disable camelcase */

import Prismic from 'prismic-javascript';
import PrismicDOM from 'prismic-dom';
import Api from 'helpers/prismic';

import { getTotalStars } from '../stars';

/** Fetch the total star count across all my GitHub repos in a way that works both client/server */
function isomorphicGetStars() {
  // If we can read process.env.GITHUB_TOKEN we can use it to make the request ourselves
  if (typeof process !== 'undefined' && process?.env?.GITHUB_TOKEN) return getTotalStars();
  // If we're client-side, we don't have the token but, we can request the API route
  return fetch('/api/stars')
    .then((r) => r.json())
    .then((data) => data.totalStars);
}


export async function getHomepage(req) {
  const [cmsData, totalGithubStars] = await Promise.all([
    // Fetch page content from CMS
    Api
      .then((api) => api.query(Prismic.Predicates.at('document.type', 'homepage')))
      .then(({ results }) => results[0].data)
      .then(({ main_title, text: textBlocks }) => ({
        title: PrismicDOM.RichText.asHtml(main_title),
        text: textBlocks.map(({ text_content }) => PrismicDOM.RichText.asHtml(text_content)),
      })),
    // Simultaneously, fetch my total number of GitHub stars from the API
    isomorphicGetStars(),
  ]);

  return {
    ...cmsData,
    text: cmsData.text
      .map((t) => t.replace(/{{age}}/g, '<span class="age"></span>'))
      .map((t) => t.replace(/{{stars_count}}/g, `<span class="stat">${totalGithubStars}</span>`)),
  };
}

export default async (req, res) => {
  const homepage = await getHomepage();
  res.status(200).json(homepage);
};
