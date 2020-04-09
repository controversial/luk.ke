import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import ResizeObserver from 'resize-observer-polyfill';

import { motion, useViewportScroll, useTransform } from 'framer-motion';
import { useLerp, useVelocity } from '../../helpers/motion';

import ParallaxSection from './ParallaxSection.jsx';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


function ParallaxScroll({ children }) {
  const { scrollY } = useViewportScroll();
  const lerpedScrollY = useLerp(scrollY, { alpha: 0.15 });
  const lerpedVelocity = useLerp(useVelocity(lerpedScrollY), { alpha: 0.25 });
  const skewY = useTransform(lerpedVelocity, [-1500, 1500], [-3, 3]);

  const rootEl = useRef(null);

  // Track the dimensions of the ParallaxScroll
  const [[width, setWidth], [height, setHeight]] = [useState(0), useState(0)];
  const ro = new ResizeObserver(([{ contentRect }]) => {
    setWidth(contentRect.width);
    setHeight(contentRect.height);
  });
  // Update dimensions on mount and whenever the size changes
  useEffect(() => {
    if (rootEl.current !== null) {
      const { width: currWidth, height: currHeight } = rootEl.current.getBoundingClientRect();
      setWidth(currWidth); setHeight(currHeight);
      ro.observe(rootEl.current);
      return () => ro.unobserve(rootEl.current);
    }
    return () => {};
  }, [rootEl]);

  const sectionHeight = height * 1.5;


  return (
    <React.Fragment>
      {/* This element is fixed at the top of the scroll and has content inside it that moves up and
          down as the user scrolls. */}
      <div className={cx('parallax-container')} ref={rootEl}>
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
                size: { width, height: sectionHeight },
              });
            })
          }
        </motion.div>
      </div>

      {/* This element expands the scroll area to the height of all of the content inside the fixed
          parallax-container */}
      <div className={cx('scroll-area-spacer')}>
        { React.Children.map(children, () => (
          <div style={{ height: sectionHeight }} />
        )) }
      </div>
    </React.Fragment>
  );
}

ParallaxScroll.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ParallaxScroll;
