import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import ResizeObserver from 'resize-observer-polyfill';

import { motion, useViewportScroll, useTransform } from 'framer-motion';
import { useLerp, useVelocity } from '../../helpers/motion';

import ParallaxSection from './ParallaxSection.jsx';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


function ParallaxScroll({ children, freeze, onFocusChange }) {
  const { scrollY } = useViewportScroll();
  const lerpedScrollY = useLerp(scrollY, { alpha: 0.15 });
  const lerpedVelocity = useLerp(useVelocity(lerpedScrollY), { alpha: 0.25 });
  const skewY = useTransform(lerpedVelocity, [-1500, 1500], [-3, 3]);

  // Nullify the scroll effect if "freeze" is set
  const noEffect = (value, set) => set(value);
  const freezeEffect = () => {};
  scrollY.attach(freeze ? freezeEffect : noEffect);

  const rootEl = useRef(null);

  // Track the dimensions of the ParallaxScroll
  const [width, setWidth] = useState(0);
  const ro = new ResizeObserver(([{ contentRect }]) => {
    setWidth(contentRect.width);
  });
  // Update dimensions on mount and whenever the size changes
  useEffect(() => {
    if (rootEl.current !== null) {
      const { width: currWidth } = rootEl.current.getBoundingClientRect();
      setWidth(currWidth);
      ro.observe(rootEl.current);
      return () => ro.unobserve(rootEl.current);
    }
    return () => {};
  }, [rootEl]);

  const sectionHeight = width * 1.5;
  const lastSectionHeight = width * 1.25;

  // Track which section has the greatest proportion of its area onscreen
  const [focusedIndex, setFocusedIndex] = useState(0);
  // On first render, report the index of the section that's focused
  useEffect(() => { onFocusChange(focusedIndex); }, []);
  // Set up an event listener to report the index of the focused section every time it changes
  useEffect(() => lerpedScrollY.onChange((y) => {
    const childrenArray = React.Children.toArray(children);
    // What proportion of each child's area is onscreen?
    const proportions = childrenArray.map((_, index) => {
      const top = index * sectionHeight - y; // relative to viewport
      const bottom = top + sectionHeight;
      let pxOnscreen = sectionHeight
        - Math.max(bottom - window.innerHeight, 0) // pixels cut off the bottom of the viewport
        - Math.max(0 - top, 0); //                    pixels cut off the top of the screen
      pxOnscreen = Math.max(pxOnscreen, 0);
      return pxOnscreen;
    });
    const idx = proportions.indexOf(Math.max(...proportions));
    if (idx !== focusedIndex) {
      setFocusedIndex(idx);
      onFocusChange(idx);
    }
  }), [focusedIndex, sectionHeight]);


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
        { React.Children.map(children, (c, idx) => {
          const isLast = idx === React.Children.count(children) - 1;
          return <div id={c.key} style={{ height: isLast ? lastSectionHeight : sectionHeight }} />;
        }) }
      </div>
    </React.Fragment>
  );
}

ParallaxScroll.propTypes = {
  children: PropTypes.node.isRequired,
  freeze: PropTypes.bool.isRequired,
  onFocusChange: PropTypes.func,
};
ParallaxScroll.defaultProps = {
  onFocusChange: () => {},
};

export default ParallaxScroll;
