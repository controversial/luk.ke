import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './Carousel.module.sass';
const cx = classNames.bind(styles);


function Carousel({
  children,
  spacing,
  itemWidth,
  className,
}) {
  // Check for missing / duplicate keys on children
  const keys = React.Children.map(children, (c) => c.key);
  const missingKeys = keys.length !== React.Children.count(children);
  const hasDuplicates = keys.some((val, idx, arr) => (arr.indexOf(val) !== idx));
  if (missingKeys || hasDuplicates) {
    throw new Error('Each child of Carousel must have a unique "key" prop');
  }

  return (
    <div className={classNames(className, cx('main'))}>
      {
        React.Children.map(
          children,
          (c) => React.cloneElement(c, { style: { width: `${itemWidth}px` } }),
        )
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
