import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, useViewportScroll, useTransform } from 'framer-motion';
import { useLerp, useVelocity } from '../../helpers/motion';

import ParallaxImage from './ParallaxImage.jsx';

import styles from './ParallaxImages.module.sass';
const cx = classNames.bind(styles);


function ParallaxImagesScroll({ children }) {
  const { scrollY } = useViewportScroll();
  const inverseScrollY = useTransform(scrollY, (y) => -y);
  const lerpedScrollY = useLerp(inverseScrollY, { alpha: 0.15 });
  const lerpedVelocity = useLerp(useVelocity(lerpedScrollY), { alpha: 0.25 });
  const skewY = useTransform(lerpedVelocity, [-1500, 1500], [-7, 7]);

  return (
    <motion.div className={cx('parallax-container')} style={{ skewY }}>
      {
        React.Children.map(children, (child) => {
          const isPxImg = child.type === ParallaxImage;
          const pxImgChild = isPxImg ? child : <ParallaxImage>{ child }</ParallaxImage>;
          return React.cloneElement(pxImgChild, { scrollMotionValue: lerpedScrollY });
        })
      }
    </motion.div>
  );
}

ParallaxImagesScroll.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ParallaxImagesScroll;
