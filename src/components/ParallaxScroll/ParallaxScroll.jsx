import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, useViewportScroll, useTransform } from 'framer-motion';
import { useLerp, useVelocity } from '../../helpers/motion';

import ParallaxSection from './ParallaxSection.jsx';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


function ParallaxScroll({ children }) {
  const { scrollY } = useViewportScroll();
  const inverseScrollY = useTransform(scrollY, (y) => -y);
  const lerpedScrollY = useLerp(inverseScrollY, { alpha: 0.15 });
  const lerpedVelocity = useLerp(useVelocity(lerpedScrollY), { alpha: 0.25 });
  const skewY = useTransform(lerpedVelocity, [-1500, 1500], [-7, 7]);

  return (
    <div className={cx('parallax-container')}>
      <motion.div className={cx('skew-container')} style={{ skewY }}>
        {
          React.Children.map(children, (child, index) => {
            // Wrap each direct child in a ParallaxSection if it's not
            const isParallaxSection = child.type === ParallaxSection;
            const child2 = isParallaxSection
              ? child
              : <ParallaxSection>{ child }</ParallaxSection>;
            // Pass certain new props to every child ParallaxSection
            return React.cloneElement(child2, {
              scrollMotionValue: lerpedScrollY,
              index,
            });
          })
        }
      </motion.div>
    </div>
  );
}

ParallaxScroll.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ParallaxScroll;
