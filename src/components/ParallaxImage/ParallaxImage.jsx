import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion } from 'framer-motion';

import styles from './ParallaxImage.module.sass';
const cx = classNames.bind(styles);


/**
 * This component provides implements the floating parallax images on the /work page.
 */

function ParallaxImage({
  image,
  parallax,
  showOverlay,
}) {
  return (<motion.div className={cx('floating-image')} />);
}
ParallaxImage.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    dimensions: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  parallax: PropTypes.shape({

  }).isRequired,
  showOverlay: PropTypes.bool,
};
ParallaxImage.defaultProps = {
  showOverlay: false,
};

export default ParallaxImage;
