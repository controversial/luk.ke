import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion } from 'framer-motion';

import styles from './Carousel.module.sass';
const cx = classNames.bind(styles);


function CarouselItem({
  deltaFromCenter,
  style,
  setCurrent,
  children,
  key,
}) {
  return (
    <motion.div
      className={cx('item', { selected: deltaFromCenter === 0 })}
      onClick={setCurrent}
      style={{ ...style }}
      key={key}
      positionTransition={{ duration: 0.5 }}
    >
      { children }
    </motion.div>
  );
}
CarouselItem.propTypes = {
  deltaFromCenter: PropTypes.number.isRequired,
  setCurrent: PropTypes.func,
  style: PropTypes.shape({ width: Number, x: Number }).isRequired,
  key: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
CarouselItem.defaultProps = {
  setCurrent: () => {},
};


function Carousel({
  children: childrenProp,
  spacing,
  itemWidth,
  className,
}) {
  const children = React.Children.toArray(childrenProp);
  // Check for missing / duplicate keys on children
  const keys = children.map((c) => c.key);
  const missingKeys = keys.some((key) => typeof key === 'undefined');
  const hasDuplicates = keys.some((val, idx, arr) => (arr.indexOf(val) !== idx));
  if (missingKeys || hasDuplicates) throw new Error('Each child of Carousel must have a unique "key" prop');

  // Initially, the first element is selected
  const [currentKey, setCurrentKey] = useState(keys[0]);

  // What index in the children array is the item that is currently centered?
  const centerIndex = children.findIndex((c2) => c2.key === currentKey);
  // We render two elements on either side of the center element, no matter how big the array is.
  // This array contains the indices, in the five-element-minimum `children` array, of those els.
  const indices = [centerIndex - 2, centerIndex - 1, centerIndex, centerIndex + 1, centerIndex + 2]
    .map((i) => i + children.length) // guarantee positive values
    .map((i) => i % children.length); // wrap around
  const renderChildren = indices.map((i) => children[i]);

  const totalWidth = (itemWidth * indices.length) + (spacing * indices.length - 1);

  return (
    <div
      className={classNames(className, cx('main'))}
      style={{ width: totalWidth }}
    >
      {
        renderChildren.map((child, index) => {
          // the center element is at position 2 and should have 'deltaFromCenter' of 0
          const deltaFromCenter = index - 2;

          return (
            <CarouselItem
              key={child.key}
              deltaFromCenter={deltaFromCenter}
              style={{ width: itemWidth }}
              setCurrent={() => setCurrentKey(child.key)}
            >
              { React.cloneElement(child) }
            </CarouselItem>
          );
        })
      }
    </div>
  );
}

Carousel.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.number,
  itemWidth: PropTypes.number,
  className: PropTypes.string,
};
Carousel.defaultProps = {
  className: undefined,
  spacing: 50,
  itemWidth: 300,
};

export default Carousel;
