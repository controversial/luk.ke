import Prismic from 'prismic-javascript';
import PrismicDOM from 'prismic-dom';
import initApi from '../../../helpers/prismic';

export default async (req, res) => {
  const api = await initApi(req);
  /* eslint-disable camelcase */
  const homepage = await api.query(Prismic.Predicates.at('document.type', 'homepage'))
    .then(({ results }) => results[0].data)
    .then(({ main_title, text }) => ({
      title: PrismicDOM.RichText.asHtml(main_title),
      text: text.map(({ text_content }) => PrismicDOM.RichText.asHtml(text_content)),
    }));
  /* eslint-enable */
  res.status(200).json(homepage);
};
