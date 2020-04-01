import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import ParallaxImage from './ParallaxImage.jsx';

import { motion, MotionValue } from 'framer-motion';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


function ParallaxSection({ children, scrollMotionValue }) {
  return (
    <motion.div
      className={cx('parallax-section')}
      style={{ y: scrollMotionValue }}
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
  scrollMotionValue: PropTypes.instanceOf(MotionValue),
};
ParallaxSection.defaultProps = { scrollMotionValue: undefined };


export default ParallaxSection;
