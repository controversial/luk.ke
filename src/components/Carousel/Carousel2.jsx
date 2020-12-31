import React from 'react';
import PropTypes from 'prop-types';

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

  return (
    <div
      className={classNames(className, cx('wrapper'))}
    >
      {/* For padding */}
      <div style={{ width: edgePadding }} />
      {/* Passed children */}
      {React.Children.map(children, (child, idx) => (
        <div
          className={cx('item')}
          key={child.key}
          style={{ width: cssItemWidth, marginRight: isLastChild(idx) ? '0' : cssSpacing }}
        >
          {child}
        </div>
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
