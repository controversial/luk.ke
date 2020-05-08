import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import Head from 'next/head';
import Error from 'next/error';

import TagsList from '../../components/TagsList';
import FramedFigure from '../../components/FramedFigure';
import Carousel from '../../components/Carousel';

import { getProject } from '../api/content/work/[project]';
import { getResizedImage } from '../../helpers/image';
import parse, { domToReact } from 'html-react-parser';

import styles from './project.module.sass';
const cx = classNames.bind(styles);


function CaseStudy({ project, errorCode }) {
  if (errorCode) return <Error statusCode={errorCode} />;

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

  const heroImage = project?.content?.hero;
  const content = project?.content?.blocks;

  // Split page content up into sections

  const contentSections = [];
  // If the first content block doesn't explicitly define the start of a section, we create a bucket
  // for that beginning content to go into.
  if (content?.[0] && content[0].type !== 'section_heading') contentSections.push([]);
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

        {/* Primary image (if it exists) */}
        {
          heroImage && (
            <FramedFigure
              className={cx('block', 'image', 'primary-image')}
              frameStyle={heroImage.frame}
              caption={heroImage.caption && parse(heroImage.caption)}
            >
              <img src={heroImage.src} alt={heroImage.alt} />
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
                        <img
                          src={getResizedImage(block.src, 200)}
                          data-src={block.src}
                          className="lazyload"
                          alt={block.alt}
                        />
                      </FramedFigure>
                    );
                  } else if (block.type === 'image_gallery') {
                    const carouselSpacing = windowWidth * 0.04 + 60;
                    // full width minus the two blocks of spacing we need to leave. .6 instead of .5
                    // so that we show slightly less than half the items to the left / right sides
                    const carouselItemWidth = (windowWidth - (carouselSpacing * 2)) * 0.6;
                    out = windowWidth === 0 ? <React.Fragment /> : (
                      <Carousel
                        className={cx('block', 'carousel', 'image-gallery')}
                        spacing={Math.floor(carouselSpacing)}
                        itemWidth={Math.floor(carouselItemWidth)}
                      >
                        { block.images.map(({ src, alt, caption }) => (
                          <FramedFigure
                            className={cx('carousel-item')}
                            frameStyle={block.frame}
                            caption={caption && parse(caption)}
                            key={src}
                          >
                            <img
                              src={getResizedImage(src, 200)}
                              data-src={src}
                              className="lazyload"
                              alt={alt}
                            />
                          </FramedFigure>
                        ))}
                      </Carousel>
                    );
                  } else {
                    out = <div className={cx('block', 'text', 'not-implemented')}>{`Not implemented: ${block.type}`}</div>;
                  }

                  // TODO: implement video, video_gallery, embed

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
