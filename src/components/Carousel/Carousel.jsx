import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, useMotionValue, MotionValue, useAnimation } from 'framer-motion';

import styles from './Carousel.module.sass';
const cx = classNames.bind(styles);


function CarouselItem({
  deltaFromCenter,
  style,
  moveCarouselBy,
  dragMotionValue,
  children,
}) {
  return (
    <motion.div
      className={cx('item', { selected: deltaFromCenter === 0 })}
      onClick={() => moveCarouselBy(deltaFromCenter)}
      drag="x"
      style={{ ...style, x: dragMotionValue }}
      dragConstraints={{ left: 0, right: 0 }}
      // Pretty easy to drag past the constraint
      dragElastic={0.8}
      // Make the snap back to center on release instant (we undo this visually when we start the
      // animation to the new position).
      // TODO: do this conditionally (not when we're not moving). Possibly: implement custom logic
      // using a custom set of dragControls
      dragTransition={{ bounceStiffness: 1000000, bounceDamping: 1000000 }}
      onDragEnd={(e, { offset: { x: offset }, velocity: { x: velocity } }) => {
        const dist = Math.abs(offset);
        if (dist > style.width || dist > window.innerWidth / 2) { // TODO: better heuristic
          moveCarouselBy(-Math.sign(offset), velocity);
        }
      }}
    >
      { children }
    </motion.div>
  );
}
CarouselItem.propTypes = {
  deltaFromCenter: PropTypes.number.isRequired,
  style: PropTypes.shape({ width: Number }).isRequired,
  moveCarouselBy: PropTypes.func.isRequired,
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
  const [currentKey, setCurrentKey] = useState(children2[0].key);
  // What index in the children array is the item that is currently centered?
  const centerIndex = children2.findIndex((c2) => c2.key === currentKey);
  // We render two elements on either side of the center element, no matter how big the array is.
  // This array contains the indices, in the five-element-minimum `children` array, of those els.
  const indices = [centerIndex - 2, centerIndex - 1, centerIndex, centerIndex + 1, centerIndex + 2]
    .map((i) => i + children2.length) // guarantee positive values
    .map((i) => i % children2.length); // wrap around
  const renderChildren = indices.map((i) => children2[i]);

  const dragX = useMotionValue(0);
  const containerControls = useAnimation();

  // Function to move the current index of the carousel by a given number of elements
  const moveBy = async (delta, dragVelocity) => {
    if (delta === 0) return;
    const newIndex = (centerIndex + delta + children2.length) % children2.length;
    // Move translation from CarouselItems to Carousel
    containerControls.set({ x: dragX.get() });
    // Animate container to new position using inertial animation that snaps there
    const newPosition = -1 * delta * (itemWidth + spacing);
    await containerControls.start({
      x: newPosition,
      transition: {
        type: 'inertia',
        min: newPosition,
        max: newPosition,
        velocity: dragVelocity || 0,
        bounceStiffness: 200,
        bounceDamping: 40,
        timeConstant: 750,
        restDelta: 1,
      },
    });
    // Invisibly change centered element and remove transform
    setCurrentKey(children2[newIndex].key);
    containerControls.set({ x: 0 });
  };

  return (
    <div className={classNames(className, cx('wrapper'))}>
      <motion.div
        className={cx('main')}
        style={{ width: (itemWidth * indices.length) + (spacing * indices.length - 1) }}
        animate={containerControls}
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
                moveCarouselBy={moveBy}
              >
                { React.cloneElement(child) }
              </CarouselItem>
            );
          })
        }
      </motion.div>
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
