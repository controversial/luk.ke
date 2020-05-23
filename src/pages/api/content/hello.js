/* eslint-disable camelcase */

import Prismic from 'prismic-javascript';
import PrismicDOM from 'prismic-dom';
import Api from 'helpers/prismic';

import { getTotalStars } from '../stars';


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
    getTotalStars(),
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
