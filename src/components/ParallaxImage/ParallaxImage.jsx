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
  style,
  showOverlay,
}) {
  const imageSize = image.dimensions;
  const dimensions = { width: '40vw', height: `${40 * (imageSize[1] / imageSize[0])}vw` };

  return (
    <motion.div
      className={cx('floating-image')}
      style={{ ...style }}
    >
      <img src={image.src} alt={image.alt} style={{ ...dimensions }} />
    </motion.div>
  );
}
ParallaxImage.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    dimensions: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  parallax: PropTypes.shape({

  }).isRequired,
  style: PropTypes.shape({ }),
  showOverlay: PropTypes.bool,
};
ParallaxImage.defaultProps = {
  showOverlay: false,
  style: {},
};

export default ParallaxImage;
