import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, MotionValue } from 'framer-motion';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


function ParallaxImage({ scrollMotionValue }) {
  return (
    <motion.div
      className={cx('parallax-image')}
      style={{ y: scrollMotionValue }}
    />
  );
}

ParallaxImage.propTypes = {
  scrollMotionValue: PropTypes.instanceOf(MotionValue),
};
ParallaxImage.defaultProps = { scrollMotionValue: undefined };

export default ParallaxImage;
