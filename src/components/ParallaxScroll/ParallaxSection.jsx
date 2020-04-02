import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import ParallaxImage from './ParallaxImage.jsx';

import { motion, MotionValue } from 'framer-motion';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


const layouts = {
  'layout-1': [
    // All position and size values are given in width percentages
    // All position values are relative to the ParallaxSection, which scrolls
    // Size is a percentage of section width and defines a square into which the image will be fit
    // ParallaxImages appear with their 'from' values when their ParallaxSection enters the bottom
    // of the viewport. They reach their 'to' values as it disappears past the top of the page
    {
      from: { right: 0, top: 40, size: 33, zoom: 1.1 },
      to: { top: 25, zoom: 1 },
    },
  ],
};

function ParallaxSection({ children, index, scrollMotionValue }) {
  return (
    <motion.div
      className={cx('parallax-section')}
      style={{
        top: `${150 * index}vh`,
        y: scrollMotionValue,
      }}
    >
      {
        React.Children.map(children, (child) => {
          // Wrap each child in a ParallaxImage if it's not
          const isParallaxImage = child.type === ParallaxImage;
          const child2 = isParallaxImage
            ? child
            : <ParallaxImage>{ child }</ParallaxImage>;
          // Pass scrollMotionValue down
          return React.cloneElement(child2, { scrollMotionValue });
        })
      }
    </motion.div>
  );
}

ParallaxSection.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number.isRequired,
  scrollMotionValue: PropTypes.instanceOf(MotionValue),
};
ParallaxSection.defaultProps = { scrollMotionValue: undefined };


export default ParallaxSection;
