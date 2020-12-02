import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import Head from 'next/head';
import Image from 'next/image';

import TagsList from 'components/TagsList';
import FramedFigure from 'components/FramedFigure';

import { getProject } from 'pages/api/content/work/[project]';
import { fetchAllProjects } from 'pages/api/content/work';
import parse from 'html-react-parser';
import { renderBlock, parseAsTextBlock as asTextBlock } from 'helpers/pages/work/case-study-blocks';

import styles from './project.module.sass';
const cx = classNames.bind(styles);


function CaseStudy({ project }) {
  const heroImage = project?.content?.hero;
  const content = (project?.content?.blocks || []);

  // Split page content up into sections

  const contentSections = [];
  // If the first content block doesn't explicitly define the start of a section, we create a bucket
  // for that beginning content to go into.
  if (content[0]?.type !== 'section_heading') contentSections.push([{ type: 'empty', id: '__first' }]);
  content.forEach((block) => {
    // Whenever we reach a section heading, we start a new section
    if (block.type === 'section_heading') contentSections.push([]);
    // We put all blocks into the last section that was established, until we reach another heading
    const lastSection = contentSections[contentSections.length - 1];
    lastSection.push(block);
  });

  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);


  return (
    <React.Fragment>
      <Head>
        <title>
          { project.name && `${project.name} | ` }
          Luke Deen Taylor
        </title>
      </Head>

      <article className={cx('page')}>
        {/* Header content */}

        { parse(project.head, asTextBlock) }
        <div className={cx('block', 'text')}>
          <TagsList max={5}>{ project.tags }</TagsList>
        </div>

        { parse(project.subhead, asTextBlock) }

        <div className={cx('block', 'text', 'links')}>
          { project.links.map((l) => (
            <a href={l.url} key={l.url} target="_blank" rel="noopener noreferrer">{ l.label }</a>
          ))}
        </div>

        {/* Primary image (if it exists) */}
        {
          heroImage && (
            <FramedFigure
              className={cx('block', 'image', 'primary-image')}
              frameStyle={heroImage.frame}
              caption={heroImage.caption && parse(heroImage.caption)}
            >
              <Image
                src={heroImage.src}
                alt={heroImage.alt}
                width={heroImage.dimensions[0]}
                height={heroImage.dimensions[1]}
                layout="responsive"
                priority
              />
            </FramedFigure>
          )
        }

        {/* Body content */}
        {
          contentSections.map((section) => (
            <section key={section[0].id} id={section[0].id} data-bg-text={section[0].content}>
              {
                section
                  .map((block) => renderBlock(block, windowWidth))
                  // eslint-disable-next-line react/no-array-index-key
                  .map((block, idx) => <React.Fragment key={idx}>{ block }</React.Fragment>)
              }
            </section>
          ))
        }
      </article>
    </React.Fragment>
  );
}

CaseStudy.propTypes = {
  project: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    head: PropTypes.string.isRequired,
    subhead: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })).isRequired,
    content: PropTypes.shape({
      hero: PropTypes.shape({
        src: PropTypes.string,
        alt: PropTypes.string,
        caption: PropTypes.string,
        frame: PropTypes.string,
      }),
      blocks: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.oneOf(['section_heading', 'content', 'image', 'image_gallery', 'video', 'video_gallery', 'embed']),
      })).isRequired,
    }).isRequired,
  }),
};
CaseStudy.defaultProps = {
  project: null,
};


Object.assign(CaseStudy, {
  pageName: 'Work',
});


export async function getStaticProps({ params }) {
  return {
    props: { project: await getProject(params.project) },
  };
}

export async function getStaticPaths() {
  const projects = await fetchAllProjects();

  return {
    // array that contains  { params: { project: PROJECT_ID } }  for each project
    paths: projects.map(({ uid }) => ({
      params: { project: uid },
    })),
    fallback: false,
  };
}

export default CaseStudy;
