import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './ParallaxImages.module.sass';
const cx = classNames.bind(styles);


function ParallaxImage() {
  return <div className={cx('parallax-image')} />;
}

ParallaxImage.propTypes = {};

export default ParallaxImage;
