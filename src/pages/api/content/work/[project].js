import { Api } from 'helpers/server/prismic';
import { processProject } from './index';

/**
 * Returns detailed information about a single project, including project metadata and longform case
 * study content, in an easy consumable format.
 * @param {*} projectId - The UID of the project to retrieve
 */
export async function getProject(projectId) {
  const api = await Api;
  const project = await api.getByUID('project', projectId);
  if (!project) throw new Error(`Couldn't find project ${projectId}`);
  else return processProject(project);
}


export default async function routeHandler(req, res) {
  res.setHeader('Cache-Control', 'max-age=0, s-maxage=60, stale-while-revalidate');
  const { project: projectId } = req.query;
  getProject(projectId)
    .catch((e) => res.status(e.message.startsWith("Couldn't find") ? 404 : 500).json({ error: e.message || e }))
    .then((project) => res.status(200).json(project));
}
