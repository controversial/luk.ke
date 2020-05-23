// import Prismic from 'prismic-javascript';
import initApi from 'helpers/prismic';
import { processProject } from './index';

/**
 * Returns detailed information about a single project, including project metadata and longform case
 * study content, in an easy consumable format.
 * @param {Object} api - A Prismic API object retrieved from Prismic.getApi
 * @param {*} projectId - The UID of the project to retrieve
 */
export async function getProject(req, projectId) {
  const api = await initApi(req);
  const project = await api.getByUID('project', projectId);
  if (!project) throw new Error(`Couldn't find project ${projectId}`);
  else return processProject(project);
}


export default async (req, res) => {
  const { project: projectId } = req.query;
  getProject(req, projectId)
    .catch((e) => res.status(e.message.startsWith("Couldn't find") ? 404 : 500).json({ error: e.message || e }))
    .then((project) => res.status(200).json(project));
};
