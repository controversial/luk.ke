import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, useViewportScroll, useTransform, useSpring } from 'framer-motion';
import { useLerp, useVelocity } from '../../helpers/motion';

import styles from './ParallaxImages.module.sass';
const cx = classNames.bind(styles);


function ParallaxImagesScroll() {
  return <div className={cx('parallax-image-scroll-container')} />;
}

ParallaxImagesScroll.propTypes = {};

export default ParallaxImagesScroll;
