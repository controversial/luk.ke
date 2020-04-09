import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, useTransform, MotionValue } from 'framer-motion';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


function ParallaxImage({ scrollProgress, layout }) {
  if (!layout.from) layout.from = layout;
  const { from } = layout;
  const to = { ...from, ...layout.to };

  const y = useTransform(scrollProgress, [0, 1], [from.top || 0, to.top || 0]);
  const s = useTransform(scrollProgress, [0, 1], [from.zoom || 1, to.zoom || 1]);

  return (
    <motion.div
      className={cx('parallax-image')}
      style={{
        left: from.left,
        right: from.left ? undefined : from.right, // don't apply right if we applied left
        width: from.size,
        height: from.size,
        y,
      }}
    />
  );
}

ParallaxImage.propTypes = {
  scrollProgress: PropTypes.instanceOf(MotionValue).isRequired,
  layout: PropTypes.shape({
    from: PropTypes.shape({
      left: Number, right: Number, top: Number, size: Number, zoom: Number,
    }).isRequired,
    to: PropTypes.shape({
      left: Number, right: Number, top: Number, size: Number, zoom: Number,
    }),
  }),
};
ParallaxImage.defaultProps = {
  layout: {},
};

export default ParallaxImage;
