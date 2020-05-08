import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './Carousel.module.sass';
const cx = classNames.bind(styles);


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

  return (
    <div className={classNames(className, cx('main'))}>
      { children.map((c) => React.cloneElement(c, { style: { width: `${itemWidth}px` } })) }
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
