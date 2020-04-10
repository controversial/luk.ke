import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import ParallaxImage from './ParallaxImage.jsx';

import { motion, MotionValue, useTransform } from 'framer-motion';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


// All position and size values are given in width percentages
// All position values are relative to the ParallaxSection, which scrolls
// Size is a percentage of section width and defines a square into which the image will be fit
// ParallaxImages appear with their 'from' values when their ParallaxSection enters the bottom
// of the viewport. They reach their 'to' values as it disappears past the top of the page
const layouts = {
  'layout-1': [
    {
      from: { top: 75, zoom: 1.4, right: 0, size: [45, 50], zIndex: 2 },
      to: { top: 10, zoom: 1 },
    },
    {
      from: { top: 6, zoom: 1, left: 0, size: [40, 45], zIndex: 1 },
      to: { top: 36, zoom: 1.2 },
    },
    {
      from: { top: 90, zoom: 1, left: 20, size: [29, 32], zIndex: 3 },
    },
  ],
};


function ParallaxSection({
  children, //                - The elements to display
  layout: layoutName, //      - Which layout pattern should this section use?
  size: { width, height }, // - How big is this section supposed to be?
  index, //                   - How many sections are before this one?
  scrollMotionValue, //       - What's the current scroll position?
}) {
  const top = height * index;
  // When the scrollMotionValue gets here, the section is at the bottom edge of the viewport
  const entryScrollPos = top - (typeof window !== 'undefined' ? window.innerHeight : 0);
  // When the scrollMotionValue gets here, the section is leaving the top edge of the viewport
  const exitScrollPos = top + height;
  const scrollProgress = useTransform(scrollMotionValue, [entryScrollPos, exitScrollPos], [0, 1]);

  const layout = layouts[layoutName];

  // Transforms a single set of ParallaxImnage layout specifications (like left, right, top, etc)
  // from width percentages to pixel values.
  const transformLayout = (lay) => ({
    ...lay,
    ...lay?.left && { left: Math.round(lay.left * (width / 100)) },
    ...lay?.right && { right: Math.round(lay.right * (width / 100)) },
    ...lay?.top && { top: Math.round(lay.top * (width / 100)) },
    ...lay?.size && {
      size: Array.isArray(lay.size)
        ? lay.size.map((s) => s * (width / 100))
        : Math.round(lay?.size * (width / 100)),
    },
  });

  return (
    <motion.section
      className={cx('parallax-section')}
      style={{
        top,
        y: useTransform(scrollMotionValue, (y) => -y),
      }}
    >
      {
        React.Children.map(children, (child, i) => {
          if (i > 2) return undefined; // max 3 images per section
          // Wrap each child in a ParallaxImage if it's not
          const isParallaxImage = child.type === ParallaxImage;
          const child2 = isParallaxImage
            ? child
            : <ParallaxImage>{ child }</ParallaxImage>;
          // Pass scrollMotionValue down
          return React.cloneElement(child2, {
            scrollProgress,
            layout: {
              ...layout[i],
              from: transformLayout(layout[i]?.from),
              to: transformLayout(layout[i]?.to),
            },
          });
        })
      }
    </motion.section>
  );
}

ParallaxSection.propTypes = {
  children: PropTypes.node.isRequired,
  layout: PropTypes.oneOf(Object.keys(layouts)),
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }),
  index: PropTypes.number,
  scrollMotionValue: PropTypes.instanceOf(MotionValue),
};
ParallaxSection.defaultProps = {
  layout: 'layout-1',
  size: { width: 1920 * 0.6, height: 1080 },
  index: 0,
  scrollMotionValue: undefined,
};


export default ParallaxSection;
