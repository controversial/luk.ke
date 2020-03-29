import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
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
  const isWindow = typeof window !== 'undefined';

  const overscroll = useMotionValue(0);
  const threshold = isWindow ? window.innerHeight : 0;
  const progress = useTransform(overscroll, [0, threshold], [0, 1]);
  const pathLength = useSpring(progress, { stiffness: 400, damping: 90 });

  // Set up wheel event listener
  useEffect(() => {
    function onScroll(e) {
      // If we're at the bottom of the scroll, increment "overscroll" by the amount we scrolled
      if (isScrolledToBottom()) overscroll.set(overscroll.get() + e.deltaY);
      // If we're not at the bottom of the scroll, record that there is no overscroll
      else overscroll.set(0);

      if (progress.get() >= 1) callback();
    }
    window.addEventListener('wheel', onScroll);
    return () => window.removeEventListener('wheel', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={classNames('overscroll-trigger', cx('overscroll-trigger'))}
      onClick={() => {
        // If we're not at the bottom, animate scroll to the bottom
        if (!isScrolledToBottom()) scrollDown();
        // If we are at the bottom, fill up the overscroll progress bar, and run the callback func
        else { overscroll.set(threshold); callback(); }
      }}
    >
      <DownArrow className={cx('arrow-down')} />
      <motion.svg className={cx('progress')} viewBox="0 0 24 24">
        <motion.path
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          strokeDasharray="0 1"
          d="
            M 4,12
            a 8,8 0 1,0 16,0
            a 8,8 0 1,0 -16,0"
          style={{
            pathLength,
            rotate: 90,
            scaleX: -1,
          }}
        />
      </motion.svg>
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
