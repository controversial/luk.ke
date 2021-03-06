/* eslint-disable camelcase */

import Prismic from 'prismic-javascript';
import PrismicDOM from 'prismic-dom';
import { Api, cleanImage } from 'helpers/server/prismic';

import { getTotalStars } from '../stars';

export async function getHomepage() {
  const [cmsData, totalGithubStars] = await Promise.all([
    // Fetch page content from CMS
    Api
      .then((api) => api.query(Prismic.Predicates.at('document.type', 'homepage')))
      .then(({ results }) => results[0].data)
      .then(async ({ main_title, text: textBlocks, hero_image, hero_image_unfiltered }) => ({
        title: PrismicDOM.RichText.asHtml(main_title),
        text: textBlocks
          .map(({ text_content }) => PrismicDOM.RichText.asHtml(text_content)),
        hero_image: {
          ...await cleanImage(hero_image),
          ...Object.fromEntries(
            Object.entries(await cleanImage(hero_image_unfiltered))
              .map(([k, v]) => [`unfiltered_${k}`, v]),
          ),
        },
      })),
    // Simultaneously, fetch my total number of GitHub stars from the API
    getTotalStars(),
  ]);

  return {
    ...cmsData,
    text: cmsData.text
      // Special replacements for interactive elements. These have to come here at the end because
      // they depend on data fetched concurrently with CMS content
      .map((t) => t.replace(/{{age}}/g, '<span class="age"></span>'))
      .map((t) => t.replace(/{{stars_count}}/g, `<span class="stat">${totalGithubStars}</span>`)),
  };
}

export default async function routeHandler(req, res) {
  res.setHeader('Cache-Control', 'max-age=0, s-maxage=60, stale-while-revalidate');
  const homepage = await getHomepage();
  res.status(200).json(homepage);
}
