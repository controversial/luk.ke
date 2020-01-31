import Prismic from 'prismic-javascript';
import initApi from '../../../helpers/prismic';

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
  const projects = await fetchAllProjects(api);
  return projects;
}

export default async (req, res) => {
  const order = await getProjects(req);
  res.status(200).json(order);
};
