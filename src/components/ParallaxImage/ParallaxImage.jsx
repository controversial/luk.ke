import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion } from 'framer-motion';

import styles from './ParallaxImage.module.sass';
const cx = classNames.bind(styles);


/**
 * This component provides implements the floating parallax images on the /work page.
 */

function ParallaxImage() {
  return (<motion.div className={cx('floating-image')} />);
}
ParallaxImage.propTypes = {};

export default ParallaxImage;
