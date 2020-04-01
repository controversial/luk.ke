import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion } from 'framer-motion';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


function ParallaxImage() {
  return (
    <motion.div
      className={cx('parallax-image')}
      style={{ y: 0 }}
    />
  );
}

ParallaxImage.propTypes = {};
ParallaxImage.defaultProps = {};

export default ParallaxImage;
