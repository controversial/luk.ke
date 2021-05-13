/* eslint-disable camelcase */
const Prismic = require('prismic-javascript');
const PrismicDOM = require('prismic-dom');
const { Api, cleanImage } = require('../../../../helpers/server/prismic');
const withClassName = require('../../../../helpers/server/addClassToMarkup');


// Helper functions

const omitUndefined = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Processes a Project document from Prismic, turning the Prismic document form into the form in
 * which it will be returned from API routes.
 * @param {Object} obj - a single document fetched from Prismic
 */
const processProject = async ({
  uid,
  data: { body, ...project },
  tags,
}, includeContent = true) => omitUndefined({
  uid,
  ...project,
  name: PrismicDOM.RichText.asText(project.name),
  head: PrismicDOM.RichText.asHtml(project.name),
  subhead: await withClassName('subhead', PrismicDOM.RichText.asHtml(project.subhead)),
  description: PrismicDOM.RichText.asHtml(project.description),
  tags,
  start_date: project.start_date.split('-').slice(0, 2).map((n) => parseInt(n, 10)),
  end_date: project.end_date.split('-').slice(0, 2).map((n) => parseInt(n, 10)),
  links: project.links.map(({ label, link }) => ({
    label,
    url: PrismicDOM.Link.url(link),
  })),
  featured_images: project.featured_images
    .map(({ image, video, video_mode, zoom }) => ({
      ...cleanImage(image),
      zoom,
      ...video.url && { video: { src: video.url, mode: video_mode } },
    })),
  featured_images_layout: project.featured_images_layout,

  // If we're including the content of the page, in addition to just simple metadata, we need to
  // process all of the rich text, etc. from the "body" of the Project entry from Prismic.
  ...includeContent && {
    content: {
      hero: (project.hero_image?.url || undefined) && {
        ...cleanImage(project.hero_image),
        frame: project.hero_image_frame,
        url: project.hero_image_link?.link_type === 'Web' ? project.hero_image_link.url : null,
        caption: PrismicDOM.RichText.asHtml(project.hero_image_caption) || null,
      },

      blocks: body.map(({ slice_type: type, primary: item, items }) => {
        // Breaks between sections
        if (type === 'section_heading') {
          return {
            type,
            id: item.section_id,
            content: PrismicDOM.RichText.asHtml(item.section_title),
          };
        }
        // Blocks of rich text content
        if (type === 'content') {
          return { type, content: PrismicDOM.RichText.asHtml(item.text_content) };
        }
        // Images
        if (type === 'image') {
          return {
            type,
            ...cleanImage(item.image),
            frame: item.frame,
            caption: PrismicDOM.RichText.asHtml(item.caption) || null,
          };
        }
        if (type === 'image_gallery') {
          return {
            type,
            frame: item.frame,
            images: items.map(({ image, caption }) => ({
              ...cleanImage(image),
              caption: PrismicDOM.RichText.asHtml(caption) || null,
            })),
          };
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
    },
  },

  hero_image: undefined,
  hero_image_caption: undefined,
  hero_image_frame: undefined,
  hero_image_link: undefined,
});


/**
 * Returns an ordered list of the IDs of all projects whose order has been defined on the
 * work_page_order page in Prismic.
 */
function getProjectsOrder() {
  /* eslint-disable camelcase */
  return Api
    .then((api) => api.query(Prismic.Predicates.at('document.type', 'work_page_order')))
    .then(({ results }) => results[0].data)
    .then(({ projects }) => projects
      .map(({ project }) => project.uid)
      .filter((id) => id));
}

/**
 * Returns an unproceed and unordered list of all projects published in Prismic
 */
function fetchAllProjects() {
  return Api
    .then((api) => api.query(Prismic.Predicates.at('document.type', 'project')))
    .then(({ results: projects }) => projects);
}

/**
 * Returns a sorted and processed list of all of the projects in Prismic, in an easy consumable
 * format.
 */
async function getProjects() {
  const [projects, order] = await Promise.all([
    fetchAllProjects(),
    getProjectsOrder(),
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

  return Promise.all(projects.map((p) => processProject(p, false)));
}

async function routeHandler(req, res) {
  const projects = await getProjects();
  res.status(200).json(projects);
}

module.exports = Object.assign(routeHandler, {
  processProject,
  getProjectsOrder,
  fetchAllProjects,
  getProjects,
});
