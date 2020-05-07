import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './Carousel.module.sass';
const cx = classNames.bind(styles);


function Carousel({
  children,
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
      { children }
    </div>
  );
}

Carousel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
Carousel.defaultProps = {
  className: undefined,
};

export default Carousel;
