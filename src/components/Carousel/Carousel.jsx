import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, useDragControls, DragControls, useAnimation } from 'framer-motion';

import styles from './Carousel.module.sass';
const cx = classNames.bind(styles);


function CarouselItem({
  deltaFromCenter,
  style,
  moveCarouselBy,
  dragControls,
  isDragging, setIsDragging,
  children,
  isMaster,
}) {
  return (
    <motion.div
      className={cx('item', { selected: deltaFromCenter === 0, isDragging })}
      style={style}

      onClick={() => !isDragging && moveCarouselBy(deltaFromCenter)}

      drag="x"
      // Implement shared drag controls among all carousel items
      dragControls={dragControls}
      dragListener={false}
      dragPropagation
      onMouseDown={(e) => dragControls.start(e)}
      // Snap to center, but make dragging past center somewhat easy
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      // Record dragging state
      onDragStart={() => { if (isMaster) setIsDragging(true); }}

      // Make the item instantly snap back to center on release (we invert this with a
      // transform when we start the animation, so there is no visual jump).
      dragTransition={{ bounceStiffness: 1000000, bounceDamping: 1000000 }}
      onDragEnd={(e, info) => {
        if (!isMaster) return; // only the 'master' CarouselItem controls the parent
        const offset = info.point.x; // point is how far it actually dragged (accounts for elastic)
        const velocity = info.velocity.x;
        moveCarouselBy(1, { offset, velocity });
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
  dragControls: PropTypes.instanceOf(DragControls).isRequired,
  isDragging: PropTypes.bool.isRequired,
  setIsDragging: PropTypes.func.isRequired,
  isMaster: PropTypes.bool.isRequired,
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
  // The master item is the item whose events orchestrates the Carousel. It changes at a slightly
  // different time from the 'centered' element.
  const [masterItemKey, setMasterItemKey] = useState(children2[0].key);
  // What index in the children array is the item that is currently centered?
  const centerIndex = children2.findIndex((c2) => c2.key === currentKey);
  // We render two elements on either side of the center element, no matter how big the array is.
  // This array contains the indices, in the five-element-minimum `children` array, of those els.
  const indices = [centerIndex - 2, centerIndex - 1, centerIndex, centerIndex + 1, centerIndex + 2]
    .map((i) => i + children2.length) // guarantee positive values
    .map((i) => i % children2.length); // wrap around
  const renderChildren = indices.map((i) => children2[i]);

  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const containerControls = useAnimation();

  // Function to move the current index of the carousel by a given number of elements
  const moveBy = async (delta, { offset, velocity } = {}) => {
    if (delta === 0) return;
    // Change centered element
    const newIndex = (centerIndex + delta + children2.length) % children2.length;
    setCurrentKey(children2[newIndex].key);
    // Transform visually back to old position
    const newIndexOffset = delta * (itemWidth + spacing);
    containerControls.set({ x: (offset || 0) + newIndexOffset });
    // Animate container back to having no transform with inertial animation
    await containerControls.start({
      x: 0,
      transition: {
        type: 'inertia',
        min: 0,
        max: 0,
        velocity: velocity || 0,
        bounceStiffness: 200,
        bounceDamping: 40,
        timeConstant: 750,
      },
    });
    setIsDragging(false);
    setMasterItemKey(children2[newIndex].key);
    containerControls.set({ x: 0 });
  };

  return (
    <div className={classNames(className, cx('wrapper'))}>
      <motion.div
        className={cx('main')}
        style={{ width: (itemWidth * indices.length) + (spacing * (indices.length - 1)) }}
        animate={containerControls}
      >
        {
          renderChildren.map((child, index) => {
            // the center element is at position 2 and should have 'deltaFromCenter' of 0
            const deltaFromCenter = index - 2;

            return (
              <CarouselItem
                key={child.key}
                isMaster={child.key === masterItemKey}
                deltaFromCenter={deltaFromCenter}
                dragControls={dragControls}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
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
