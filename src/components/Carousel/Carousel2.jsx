import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { useWindowWidth } from 'helpers/hooks';
import { motion, MotionValue } from 'framer-motion';

import styles from './Carousel2.module.sass';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

// Treat numbers as pixel values and anything else as a full CSS string
const toCss = (value) => (typeof value === 'number' ? `${value}px` : value);

export default function Carousel({ children, spacing, itemWidth, className }) {
  const cssSpacing = toCss(spacing);
  const cssItemWidth = toCss(itemWidth);
  const edgePadding = `calc((100vw - ${cssItemWidth}) / 2)`;

  const isLastChild = (idx) => idx === React.Children.count(children) - 1;

  const windowWidth = useWindowWidth();
  // One ref for each item
  const itemRefs = useRef([]);
  if (itemRefs.current.length !== React.Children.count(children)) {
    itemRefs.current = React.Children.map(children, () => React.createRef());
  }
  // Keep track of the X coordinate of the center of each card within the scroll container
  const [cardCenters, setCardCenters] = useState([]);
  useEffect(() => {
    setCardCenters(itemRefs.current.map(({ current: el }) => el.offsetLeft + (el.offsetWidth / 2)));
  }, [itemRefs.current, spacing, itemWidth, windowWidth]);
  // Set card opacity based on distance from center
  const baseRef = useRef(null);
  const cardOpacities = useRef([]);
  if (cardOpacities.current.length !== React.Children.count(children)) {
    cardOpacities.current = React.Children.map(children, () => new MotionValue(1));
  }
  useEffect(() => {
    const updateOpacity = () => {
      const { scrollLeft } = baseRef.current;
      const scrollXCenter = scrollLeft + (windowWidth / 2);
      React.Children.forEach(children, (_, i) => {
        const distanceFromCenter = Math.abs(scrollXCenter - cardCenters[i]);
        const distanceBetweenCards = cardCenters[1] - cardCenters[0];
        cardOpacities.current[i].set(1 - (distanceFromCenter / distanceBetweenCards) * 0.15);
      });
    };
    updateOpacity();
    const base = baseRef.current;
    base.addEventListener('scroll', updateOpacity);
    return () => base.removeEventListener('scroll', updateOpacity);
  }, [baseRef.current, windowWidth]);

  return (
    <div
      className={classNames(className, cx('wrapper'))}
      ref={baseRef}
    >
      {/* For padding */}
      <div style={{ width: edgePadding }} />
      {/* Passed children */}
      {React.Children.map(children, (child, idx) => (
        <motion.div
          className={cx('item')}
          key={child.key}
          style={{
            width: cssItemWidth,
            marginRight: isLastChild(idx) ? '0' : cssSpacing,
            opacity: cardOpacities.current[idx],
          }}
          ref={itemRefs.current[idx]}
        >
          {child}
        </motion.div>
      ))}
      {/* For padding */}
      <div style={{ width: edgePadding }} />
    </div>
  );
}

Carousel.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  itemWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
};
Carousel.defaultProps = {
  className: undefined,
  spacing: 50,
  itemWidth: 300,
};
