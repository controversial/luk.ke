import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import Head from 'next/head';
import Error from 'next/error';

import TagsList from '../../components/TagsList';
import FramedFigure from '../../components/FramedFigure';

import { getProject } from '../api/content/work/[project]';
import parse, { domToReact } from 'html-react-parser';

import styles from './project.module.sass';
const cx = classNames.bind(styles);


function CaseStudy({ project, errorCode }) {
  /* eslint-disable react/prop-types */
  function addClassName({ name: tag, attribs, children, parent }, className) {
    if (!attribs || parent) return undefined; // only apply to the root node
    const existingClassName = attribs.class;
    delete attribs.class;
    return React.createElement(tag, {
      ...attribs, className: cx(existingClassName || '', className).trim(),
    }, domToReact(children));
  }
  /* eslint-enable */
  const asTextBlock = { replace: (node) => addClassName(node, ['block', 'text']) };

  // If the first piece of page content is an image, this image becomes the "primary image" and is
  // removed from the main array of content
  let primaryImage = null;
  let { content } = project;
  if (content[0]?.type === 'image') {
    primaryImage = content[0]; // eslint-disable-line prefer-destructuring
    content = content.slice(1);
  }

  // Split page content up into sections

  const contentSections = [];
  // If the first content block doesn't explicitly define the start of a section, we create a bucket
  // for that beginning content to go into.
  if (content[0]?.type !== 'section_heading') contentSections.push([]);
  content.forEach((block) => {
    // Whenever we reach a section heading, we start a new section
    if (block.type === 'section_heading') contentSections.push([]);
    // We put all blocks into the last section that was established, until we reach another heading
    const lastSection = contentSections[contentSections.length - 1];
    lastSection.push(block);
  });


  if (errorCode) return <Error statusCode={errorCode} />;

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

        {/* Primary image (if it exists) */}
        {
          primaryImage && (
            <FramedFigure
              className={cx('block', 'image', 'primary-image')}
              frameStyle={primaryImage.frame}
              caption={primaryImage.caption && parse(primaryImage.caption)}
            >
              <img src={primaryImage.src} alt={primaryImage.alt} />
            </FramedFigure>
          )
        }

        {/* Body content */}
        {
          contentSections.map((section) => (
            <section key={section[0].id} id={section[0].id}>
              {
                section.map((block, idx) => {
                  let out;
                  if (block.type === 'section_heading') out = parse(block.content, asTextBlock);
                  else if (block.type === 'content') out = parse(block.content, asTextBlock);
                  else if (block.type === 'image') {
                    out = (
                      <FramedFigure
                        className={cx('block', 'image')}
                        frameStyle={block.frame}
                        caption={block.caption && parse(block.caption)}
                      >
                        <img src={block.src} alt={block.alt} />
                      </FramedFigure>
                    );
                  } else {
                    out = <div className={cx('block', 'text', 'not-implemented')}>{`Not implemented: ${block.type}`}</div>;
                  }

                  // TODO: implement image_gallery, video, video_gallery, embed

                  return React.Children.map(out, (el, idx2) => (
                    // eslint-disable-next-line react/no-array-index-key
                    React.cloneElement(el, { key: `${idx}-${idx2}` })
                  ));
                })
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
    content: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(['section_heading', 'content', 'image', 'image_gallery', 'video', 'video_gallery', 'embed']),
    })).isRequired,
  }),
  errorCode: PropTypes.number,
};
CaseStudy.defaultProps = {
  project: null,
  errorCode: null,
};


Object.assign(CaseStudy, {
  pageName: 'Work',

  async getInitialProps(ctx) {
    try {
      return { project: await getProject(ctx.req, ctx.query.project) };
    } catch (e) {
      const statusCode = e.message.startsWith("Couldn't find") ? 404 : 500;
      return { errorCode: statusCode };
    }
  },
});

export default CaseStudy;
