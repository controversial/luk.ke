import Prismic from 'prismic-javascript';
import PrismicDOM from 'prismic-dom';
import initApi from '../../../helpers/prismic';


export async function getContactPage(req) {
  const api = await initApi(req);

  const data = await api.query(Prismic.Predicates.at('document.type', 'contact'))
    .then(({ results }) => results[0].data);

  return {
    title: data.title[0].text,
    links: data.links.map(({ label, link: { url } }) => ({ label, url })),
    contact_form_success_message: PrismicDOM.RichText.asHtml(data.contact_form_success_message),
  };
}

export default async (req, res) => {
  const contactPage = await getContactPage(req);
  res.status(200).json(contactPage);
};
