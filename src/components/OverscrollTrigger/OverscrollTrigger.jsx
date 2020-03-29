import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { spring } from 'popmotion';
import DownArrow from '../../../public/static/icons/down-arrow.svg';

import styles from './OverscrollTrigger.module.sass';
const cx = classNames.bind(styles);


function isScrolledToBottom() {
  const scrollBottom = window.innerHeight + window.scrollY + 1;
  const maxScroll = document.body.scrollHeight;
  return scrollBottom >= maxScroll;
}

function scrollDown() {
  const pageDown = window.scrollY + window.innerHeight;
  const bottom = document.body.scrollHeight - window.innerHeight;
  spring({
    from: window.scrollY,
    to: Math.min(pageDown, bottom),
    mass: 1,
    stiffness: 400,
    damping: 90,
  }).start({
    update: (value) => { window.scrollTo(window.scrollX, value); },
  });
}

function OverscrollTrigger({ callback }) {
  return (
    <button
      type="button"
      className={classNames('overscroll-trigger', cx('overscroll-trigger'))}
      onClick={() => {
        // If we're not at the bottom, animate scroll to the bottom
        if (!isScrolledToBottom()) scrollDown();
        // If we are at the bottom, run the callback func
        else callback();
      }}
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
