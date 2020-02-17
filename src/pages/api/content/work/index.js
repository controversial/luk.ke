import Prismic from 'prismic-javascript';
import PrismicDOM from 'prismic-dom';
import initApi from '../../../../helpers/prismic';
import withClassName from '../../../../helpers/addClass';


// Helper functions

/**
 * Processes a Project document from Prisma, turning the Prisma document form into the form in which
 * it will be returned from API routes.
 * @param {Object} obj - a single document fetched from Prisma
 */
export const processProject = async ({ uid, data: project }) => ({
  uid,
  ...project,
  name: PrismicDOM.RichText.asHtml(project.name),
  subhead: await withClassName('subhead', PrismicDOM.RichText.asHtml(project.subhead)),
  description: PrismicDOM.RichText.asHtml(project.description),
  start_date: project.start_date.split('-').slice(0, 2).map((n) => parseInt(n, 10)),
  end_date: project.end_date.split('-').slice(0, 2).map((n) => parseInt(n, 10)),
  github_link: PrismicDOM.Link.url(project.github_link),
  featured_images: project.featured_images.map(({ image }) => image.url),

  body: undefined,
  content: project.body.map(({ slice_type: type, primary: item, items }) => {
    // Breaks between sections
    if (type === 'section_heading') {
      return { type, content: PrismicDOM.RichText.asHtml(item.section_title) };
    }
    // Blocks of rich text content
    if (type === 'content') {
      return { type, content: PrismicDOM.RichText.asHtml(item.text_content) };
    }
    // Images
    if (type === 'image') {
      return { type, src: item.image.url, alt: item.image.alt };
    }
    if (type === 'image_gallery') {
      return { type, images: items.map(({ image }) => ({ src: image.url, alt: image.alt })) };
    }
    // Videos
    if (type === 'video') {
      return { type, src: items?.[0]?.video?.url };
    }
    if (type === 'video_gallery') {
      return { type, srcs: items.map(({ video }) => video.url) };
    }
    // Embeds
    if (type === 'embed') {
      return { type, content: item.embed?.html, meta: { ...item.embed, html: undefined } };
    }

    return { type, content: Object.keys(item || {}).length ? item : items };
  }),
});


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

  return Promise.all(projects.map(processProject));
}

export default async (req, res) => {
  const projects = await getProjects(req);
  res.status(200).json(projects);
};
