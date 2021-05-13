import Prismic from 'prismic-javascript';
import PrismicDOM from 'prismic-dom';
import { Api } from 'helpers/server/prismic';


export async function getContactPage() {
  const data = await Api
    .then((api) => api.query(Prismic.Predicates.at('document.type', 'contact')))
    .then(({ results }) => results[0].data);

  return {
    title: data.title[0].text,
    links: data.links.map(({ label, link: { url } }) => ({ label, url })),
    contact_form_success_message: PrismicDOM.RichText.asHtml(data.contact_form_success_message),
  };
}

export default async function routeHandler(req, res) {
  res.setHeader('Cache-Control', 'max-age=0, s-maxage=60, stale-while-revalidate');
  const contactPage = await getContactPage();
  res.status(200).json(contactPage);
}
