import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './Carousel.module.sass';
const cx = classNames.bind(styles);


function Carousel({
  children,
  className,
}) {
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
