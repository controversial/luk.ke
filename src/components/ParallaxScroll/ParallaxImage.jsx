import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, useTransform, MotionValue } from 'framer-motion';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


function ParallaxImage({ img, layout, overlay, scrollProgress }) {
  if (!layout.from) layout.from = layout;
  const { from } = layout;
  const to = { ...from, ...layout.to };

  const y = useTransform(scrollProgress, [0, 1], [from.top || 0, to.top || 0]);
  const scale = useTransform(scrollProgress, [0, 1], [from.zoom || 1, to.zoom || 1]);

  // fit image into size box specified in layout.size

  const fitWidth = from.size?.[0] || from.size;
  const fitHeight = from.size?.[1] || from.size;
  const { dimensions: [imgWidth, imgHeight] } = img;

  let width; let height;
  // if the image aspect ratio is wider than the container box, fit by width
  if ((imgWidth / imgHeight) > (fitWidth / fitHeight)) {
    width = fitWidth;
    height = width * (imgHeight / imgWidth);
  // If the image aspect ratio is taller than the container box, fit by height
  } else {
    height = fitHeight;
    width = height * (imgWidth / imgHeight);
  }

  return (
    <motion.div
      className={cx('parallax-image')}
      style={{
        y,
        left: from.left,
        right: from.left ? undefined : from.right, // don't apply right if we applied left
        width: from.size?.[0] || from.size,
        height: from.size?.[1] || from.size,
        zIndex: from.zIndex,
        // if we're up against the left or right edge, make sure the fitted image is still against
        // that side
        ...from.left === 0 && { justifyContent: 'flex-start' },
        ...from.right === 0 && { justifyContent: 'flex-end' },
      }}
    >
      <div style={{ width, height }}>
        { overlay ? <div className={cx('overlay')} /> : undefined }
        <motion.img src={img.src} alt={img.alt} style={{ width, height, scale }} />
      </div>
    </motion.div>
  );
}

const layoutParams = {
  left: PropTypes.number,
  right: PropTypes.number,
  top: PropTypes.number,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
  zoom: PropTypes.number,
  zIndex: PropTypes.number,
};

ParallaxImage.propTypes = {
  scrollProgress: PropTypes.instanceOf(MotionValue).isRequired,
  layout: PropTypes.shape({
    from: PropTypes.shape(layoutParams).isRequired,
    to: PropTypes.shape(layoutParams),
  }),
  img: PropTypes.shape({
    alt: PropTypes.string,
    dimensions: PropTypes.arrayOf(PropTypes.number).isRequired,
    src: PropTypes.string.isRequired,
  }).isRequired,
  overlay: PropTypes.bool,
};
ParallaxImage.defaultProps = {
  layout: {},
  overlay: false,
};

export default ParallaxImage;
