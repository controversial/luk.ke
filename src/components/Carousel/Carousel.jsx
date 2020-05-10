import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion } from 'framer-motion';

import styles from './Carousel.module.sass';
const cx = classNames.bind(styles);


function CarouselItem({
  deltaFromCenter,
  children,
}) {
  return (
    <motion.div className={cx('item', { selected: deltaFromCenter === 0 })}>
      { children }
    </motion.div>
  );
}
CarouselItem.propTypes = {
  deltaFromCenter: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
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

  const [currentKey, setCurrentKey] = useState(keys[0]);

  return (
    <div className={classNames(className, cx('main'))}>
      {
        children.map((c) => {
          const centerIndex = children.findIndex((c2) => c2.key === currentKey);
          const deltaFromCenter = children.indexOf(c) - centerIndex;

          return (
            <CarouselItem key={c.key} deltaFromCenter={deltaFromCenter}>
              { c }
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
