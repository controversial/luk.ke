import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, useMotionValue, useTransform, useSpring, useAnimation } from 'framer-motion';
import { useTransformMulti, delay } from 'helpers/motion';
import { spring } from 'popmotion';
import debounce from 'lodash/debounce';

import styles from './OverscrollTrigger.module.sass';
const cx = classNames.bind(styles);


// Returns true if the window is scrolled within 'threshold' px of its bottom
export function isScrolledToBottom(threshold = 0) {
  const { scrollingElement: se } = document;
  const scrollBottom = se.offsetHeight + se.scrollTop + 1;
  const maxScroll = se.scrollHeight;
  return (scrollBottom + threshold) >= maxScroll;
}

function scrollDown() {
  const { scrollingElement: se } = document;
  const pageDown = se.scrollTop + se.offsetHeight; // one "window height" down
  const bottom = se.scrollHeight - se.offsetHeight; // bottom of page
  return new Promise((resolve) => {
    spring({
      from: se.scrollTop,
      to: Math.min(pageDown, bottom),
      mass: 1,
      stiffness: 400,
      damping: 90,
    }).start({
      update: (value) => { se.scrollTo(0, value); },
      complete: resolve,
    });
  });
}


/**
 * Renders a "scroll down" message that triggers a callback once the user has overscrolled by a
 * certain amount (1.5x the window height by default)
 *
 * Props:
 * - callback: called when the user has overscrolled
 * - precallback: called with "true" when it's likely that the callback will be called, and
 *   called with "false" if that's cancelled.
 */
function OverscrollTrigger({ callback, preCallback }) {
  const isWindow = typeof window !== 'undefined';

  const overscroll = useMotionValue(0);
  const threshold = isWindow ? document.body.offsetHeight * 1.5 : 0; // how much overscroll triggers
  const progress = useTransform(overscroll, [0, threshold], [0, 1]);
  const arrowIsHidden = useMotionValue(0); // set to 1 when arrow is hidden
  // pathLength is always 0 while the arrow is not hidden
  const pathLength = useTransformMulti([progress, arrowIsHidden], (a, b) => a * b);
  // Animate changes to pathLength
  const pathLengthSpring = useSpring(pathLength, { stiffness: 400, damping: 90 });

  const arrowControls = useAnimation();
  useEffect(() => arrowControls.set('visible'), [arrowControls]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCallback = useCallback(
    debounce(callback, 1000, { leading: true, trailing: false }),
    [callback],
  );

  // Set up wheel event listener
  useEffect(() => {
    function onScroll(e) {
      // When we first start overscroll, hide the arrow
      if (isScrolledToBottom() && e.deltaY > 0 && overscroll.get() === 0) {
        preCallback(true); // once we start overscrolling it's likely that callback will be called
        arrowControls.start('hidden')
          .then(() => delay(100))
          .then(() => { arrowIsHidden.set(1); });
      }
      // If we're at the bottom of the scroll, increment "overscroll" by the amount we scrolled
      if (isScrolledToBottom()) overscroll.set(overscroll.get() + e.deltaY);
      // If we're not at the bottom of the scroll, record that there is no overscroll
      else {
        overscroll.set(0);
        // It's no longer likely that we will trigger
        preCallback(false);
        // If the arrow is shown, hide it
        if (arrowIsHidden.get()) {
          arrowIsHidden.set(false);
          const unbind = pathLengthSpring.onChange((val) => {
            // Once the pathLength gets set to 0, we animate the arrow back in.
            if (val <= 0.05) { arrowControls.start('visible'); unbind(); }
          });
        }
      }
      // Run the callback when it fills all the way up
      if (progress.get() >= 1) {
        debouncedCallback();
      }
    }
    document.scrollingElement.addEventListener('wheel', onScroll);
    return () => document.scrollingElement.removeEventListener('wheel', onScroll);
  }, [
    // Motion values (effect hook runs when their identity changes, not when their value changes)
    arrowIsHidden, overscroll, pathLengthSpring, progress,
    // Other dependencies (many are static or almost static)
    arrowControls, debouncedCallback, preCallback,
  ]);


  return (
    <button
      type="button"
      className={classNames('overscroll-trigger', cx('overscroll-trigger'))}
      onClick={() => {
        // If we're not at the bottom, animate scroll to the bottom
        if (!isScrolledToBottom(100)) scrollDown();
        // If we are at the bottom, fill up the overscroll progress bar, and run the callback func
        else {
          // Hide arrow controls
          arrowControls.start('hidden')
            .then(() => delay(50))
            .then(() => arrowIsHidden.set(1));
          // Fill up progress bar
          overscroll.set(threshold);
          // Once the animation has gotten going, run the callback
          if (arrowIsHidden.get()) callback();
          else {
            const unbind = arrowIsHidden.onChange(() => { unbind(); callback(); });
          }
        }
      }}
      // Trigger is likely whenever we hover and a click would trigger the callback
      // However, try not to call again if we have already run the preCallback from overscroll
      onMouseEnter={() => { if (isScrolledToBottom(100) && !overscroll.get()) preCallback(true); }}
      onMouseLeave={() => { if (isScrolledToBottom(100) && !overscroll.get()) preCallback(false); }}
    >
      {/* "down arrow" shows before we're overscrolling */}
      <motion.svg
        className={cx('arrow-down')}
        viewBox="0 0 24 24"
        style={{ originX: '50%', originY: '50%' }}
        variants={{
          hidden: {
            opacity: 0.5, scale: 0, transition: { duration: 0.15, ease: [0.11, 0, 0.5, 0] },
          },
          visible: { opacity: 1, scale: 1 },
        }}
        animate={arrowControls}
      >
        <g>
          <polygon fill="currentColor" fillRule="nonzero" points="20 12 18.59 10.59 13 16.17 13 3 11 3 11 16.17 5.42 10.58 4 12 12 20" />
        </g>
      </motion.svg>

      {/* Once we're overscrolling a radial progress bar is displayed */}
      <svg className={cx('progress')} viewBox="0 0 24 24">
        <motion.path
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          strokeDasharray="0 1"
          d="
            M 4,12
            a 8,8 0 1,0 16,0
            a 8,8 0 1,0 -16,0
          "
          style={{
            pathLength: pathLengthSpring,
            opacity: useTransform(pathLengthSpring, (length) => (length > 0 ? 1 : 0)),
            rotate: 90,
            scaleX: -1,
          }}
        />
      </svg>
      Scroll down
    </button>
  );
}
OverscrollTrigger.propTypes = {
  callback: PropTypes.func,
  preCallback: PropTypes.func,
};
OverscrollTrigger.defaultProps = {
  callback: () => {},
  preCallback: () => {},
};

export default OverscrollTrigger;
