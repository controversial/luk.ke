import Prismic from 'prismic-javascript';
import PrismicDOM from 'prismic-dom';
import initApi from '../../../helpers/prismic';
import withClassName from '../../../helpers/addClass';


/**
 * Returns an ordered list of the IDs of all projects whose order has been defined on the
 * work_page_order page in Prismic.
 * @param {Object} api - A Prismic API object retrieved from Prismic.getApi
 */
export function getProjectsOrder(api) {
  /* eslint-disable camelcase */
  return api.query(Prismic.Predicates.at('document.type', 'work_page_order'))
    .then(({ results }) => results[0].data)
    .then(({ projects }) => projects
      .map(({ project }) => project.uid)
      .filter((id) => id));
}

/**
 * Returns an unproceed and unordered list of all projects published in Prismic
 * @param {Object} api - A Prismic API object retrieved from Prismic.getApi
 */
export function fetchAllProjects(api) {
  return api.query(Prismic.Predicates.at('document.type', 'project'))
    .then(({ results: projects }) => projects);
}

export async function getProjects(req) {
  const api = await initApi(req);
  const [projects, order] = await Promise.all([
    fetchAllProjects(api),
    getProjectsOrder(api),
  ]);

  // Returns sorting ranks for project UIDs, where lower ranks should come earlier in the sorted
  // list.
  function rankOrder(uid) {
    const index = order.indexOf(uid);
    // Place UIDs missing from the order at the end
    if (index === -1) return order.length;
    return index;
  }

  projects.sort((a, b) => rankOrder(a.uid) - rankOrder(b.uid));

  return Promise.all(projects.map(async ({ data: project }) => ({
    ...project,
    name: PrismicDOM.RichText.asHtml(project.name),
    subhead: await withClassName('subhead', PrismicDOM.RichText.asHtml(project.subhead)),
    description: PrismicDOM.RichText.asHtml(project.description),
    start_date: project.start_date.split('-').slice(0, 2).map((n) => parseInt(n, 10)),
    end_date: project.end_date.split('-').slice(0, 2).map((n) => parseInt(n, 10)),
    github_link: PrismicDOM.Link.url(project.github_link),
  })));
}

export default async (req, res) => {
  const order = await getProjects(req);
  res.status(200).json(order);
};
