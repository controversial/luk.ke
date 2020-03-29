import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import DownArrow from '../../../public/static/icons/down-arrow.svg';

import styles from './OverscrollTrigger.module.sass';
const cx = classNames.bind(styles);


function OverscrollTrigger({ callback }) {
  return (
    <button
      type="button"
      className={classNames('overscroll-trigger', cx('overscroll-trigger'))}
      onClick={callback}
    >
      <DownArrow className={cx('arrow-down')} />
      Scroll down
    </button>
  );
}
OverscrollTrigger.propTypes = {
  callback: PropTypes.func,
};
OverscrollTrigger.defaultProps = {
  callback: () => {},
};

export default OverscrollTrigger;
