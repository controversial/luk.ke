import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, useMotionValue, MotionValue } from 'framer-motion';

import styles from './Carousel.module.sass';
const cx = classNames.bind(styles);


function CarouselItem({
  deltaFromCenter,
  style,
  setAsCurrent,
  dragMotionValue,
  children,
}) {
  return (
    <motion.div
      className={cx('item', { selected: deltaFromCenter === 0 })}
      onClick={setAsCurrent}
      drag="x"
      style={{ ...style, x: dragMotionValue }}
      dragConstraints={{ left: 0, right: 0 }}
    >
      { children }
    </motion.div>
  );
}
CarouselItem.propTypes = {
  deltaFromCenter: PropTypes.number.isRequired,
  style: PropTypes.shape({ width: Number }).isRequired,
  setAsCurrent: PropTypes.func.isRequired,
  dragMotionValue: PropTypes.instanceOf(MotionValue).isRequired,
  children: PropTypes.node.isRequired,
};


function Carousel({
  children: childrenProp,
  spacing,
  itemWidth,
  className,
}) {
  const children = React.Children.toArray(childrenProp);
  // If there are no children, return just the wrapper element
  if (!children.length) return <div className={classNames(className, cx('wrapper'))} />;
  // Check for missing / duplicate keys on children
  const keys = children.map((c) => c.key);
  const missingKeys = keys.some((key) => typeof key === 'undefined');
  const hasDuplicates = keys.some((val, idx, arr) => (arr.indexOf(val) !== idx));
  if (missingKeys || hasDuplicates) throw new Error('Each child of Carousel must have a unique "key" prop');
  // Repeat children array until we have at least five children
  while (children.length < 5) children.push(...children);
  // Make sure that any child elements that we duplicated will still have unique keys if rendered
  // multiple times
  const children2 = children.map((c, i) => React.cloneElement(c, { key: `${c.key}@${i}` })); // eslint-disable-line react/no-array-index-key
  // Invariant at this point: `children` has five or more elements

  // Initially, the first element is selected
  const [currentKey, setCurrentKey] = useState(keys[0]);

  // What index in the children array is the item that is currently centered?
  const centerIndex = children2.findIndex((c2) => c2.key === currentKey);
  // We render two elements on either side of the center element, no matter how big the array is.
  // This array contains the indices, in the five-element-minimum `children` array, of those els.
  const indices = [centerIndex - 2, centerIndex - 1, centerIndex, centerIndex + 1, centerIndex + 2]
    .map((i) => i + children2.length) // guarantee positive values
    .map((i) => i % children2.length); // wrap around
  const renderChildren = indices.map((i) => children2[i]);

  const dragX = useMotionValue(0);

  return (
    <div className={classNames(className, cx('wrapper'))}>
      <div
        className={cx('main')}
        style={{ width: (itemWidth * indices.length) + (spacing * indices.length - 1) }}
      >
        {
          renderChildren.map((child, index) => {
            // the center element is at position 2 and should have 'deltaFromCenter' of 0
            const deltaFromCenter = index - 2;

            return (
              <CarouselItem
                key={child.key}
                deltaFromCenter={deltaFromCenter}
                dragMotionValue={dragX}
                style={{ width: itemWidth }}
                setAsCurrent={() => setCurrentKey(child.key)}
              >
                { React.cloneElement(child) }
              </CarouselItem>
            );
          })
        }
      </div>
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
