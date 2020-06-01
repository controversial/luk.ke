import React from 'react';

import FramedFigure from 'components/FramedFigure';
import Carousel from 'components/Carousel';

import { getResizedImage } from 'helpers/image';
import parse, { domToReact } from 'html-react-parser';

import classNames from 'classnames/bind';
import styles from './project.module.sass';
const cx = classNames.bind(styles);


/* eslint-disable react/prop-types */
function addClassName({ name: tag, attribs, children, parent }, className) {
  if (!attribs || parent) return undefined; // only apply to the root node
  const existingClassName = attribs.class;
  delete attribs.class;
  return React.createElement(tag, {
    ...attribs, className: cx(existingClassName || '', className).trim(),
  }, domToReact(children));
}

export const parseAsTextBlock = { replace: (node) => addClassName(node, ['block', 'text']) };


const renderImageBlock = (block) => (
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

const renderImageGalleryBlock = (block, windowWidth) => {
  const carouselSpacing = windowWidth * 0.1;
  const carouselItemWidth = windowWidth > 550
    // full width minus the two blocks of spacing we need to leave. .6 (over .5) so that we show
    // slightly less than half the items to the left / right sides
    ? (windowWidth - (carouselSpacing * 2)) * 0.6
    // on mobile show even less of the sides
    : (windowWidth - (carouselSpacing * 2)) * 0.9;
  return windowWidth === 0 ? <React.Fragment /> : (
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
};


export function renderBlock({ type, ...block }, windowWidth) {
  switch (type) {
    case 'section_heading':
      return parse(block.content, parseAsTextBlock);
    case 'content':
      return parse(block.content, parseAsTextBlock);
    case 'image':
      return renderImageBlock(block);
    case 'image_gallery':
      return renderImageGalleryBlock(block, windowWidth);
    // TODO: implement video, video_gallery, embed
    default:
      return (
        <div className={cx('block', 'text', 'not-implemented')}>
          {`Not implemented: ${type}`}
        </div>
      );
  }
}
