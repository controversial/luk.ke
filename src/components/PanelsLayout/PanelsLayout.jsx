import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Router, useRouter } from 'next/router';
import { useStore } from '../../store';

import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Menu from '../Menu/Menu.jsx';
import MenuIcon from '../MenuIcon/MenuIcon.jsx';

import getOrientationClass from '../../helpers/getOrientationClass';

import styles from './PanelsLayout.module.sass';
const cx = classNames.bind(styles);


function FadeOnChange({ watch, children, style }) {
  const { state: { menuOpen } } = useStore();

  return (
    <AnimatePresence exitBeforeEnter initial={false}>
      <motion.div
        key={watch} // When key changes, react will unmount/remount this component
        style={{ opacity: 0, willChange: menuOpen ? 'opacity' : 'auto', ...style }}
        animate={{ opacity: 1, transition: { delay: 0.25 } }}
        exit={{ opacity: 0 }}
        transition={{ type: 'tween', duration: 0.5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
FadeOnChange.propTypes = {
  watch: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
FadeOnChange.defaultProps = {
  style: {},
};


/**
 * This component provides a layout with four full-height sections: a light colored panel with
 * fixed-position content, a dark section behind/to the side of the light panel with scrolling
 * content, and a menu component off screen to each side.
 */

function PanelsLayout({ lightContent, darkContent, orientation, currPageName }) {
  // Get the class name to go with the panel orientation
  const orientationClass = getOrientationClass(orientation);

  // Whether or not the menu is open is recorded in the global application store
  const { state: { menuOpen, dimensions }, dispatch } = useStore();
  const variant = menuOpen ? 'menu-open' : 'menu-closed';

  // We need the page name so that we can force everything to re-render when the URL changes
  const router = useRouter();
  const routerPath = router.asPath;
  Router.events.on('routeChangeComplete', () => dispatch('setMenuOpen', false));

  // The offset, in px, to be applied to the PanelsLayout to display the menu
  const openOffset = orientation === 'right' ? -dimensions.menuWidth : dimensions.menuWidth;
  // This is the amount the whole panels container is transformed by when opening/closing the menu
  const x = useMotionValue(0);
  const inverseX = useTransform(x, (val) => val * -1);
  // This maps the motion of the PanelsLayout to the opacity of the content
  const contentOpacity = useTransform(x, [0, openOffset], [1, 0.5]);

  return (
    // Using display: contents makes this behave like a Fragment but we can add Framer Motion props
    // to it, which propagate to children.
    <motion.div
      style={{ display: 'contents' }}
      animate={variant}
      initial={false}
    >
      {/*
        The main panels container. Displays a dark and light panel that fill up the whole viewport,
        as well as a menu to the left and the right. This whole container shifts to the left/right
        to reveal the menu.
      */}
      <motion.div
        className={cx('panels-layout', orientationClass, { 'menu-open': menuOpen })}
        style={{ x }}
        variants={{
          'menu-open': { x: openOffset },
          'menu-closed': { x: 0 },
        }}
        transition={{ type: 'tween', duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* There's a menu off screen to the left */}
        <FadeOnChange watch={routerPath}>
          <Menu orientation="left" />
        </FadeOnChange>

        {/* Light panel */}
        <motion.div
          positionTransition={{ duration: 0.5, delay: 0.5 }}
          className={cx('panel', 'light')}
          style={{ gridColumn: {
            left: 'viewport-left / fifth 2',
            right: 'fifth 3 / viewport-right',
            full: 'viewport-left / viewport-right',
          }[orientation] }}
        >
          <div className={cx('nav-cover')} />
          <motion.div
            className={cx('content')}
            style={{ opacity: contentOpacity, pointerEvents: menuOpen ? 'none' : 'all' }}
          >
            <FadeOnChange watch={routerPath}>{ lightContent }</FadeOnChange>
          </motion.div>
        </motion.div>

        {/* Dark content sits "behind" and to the side of right panel */}
        { orientation === 'full' ? null
          : (
            <motion.div
              positionTransition={{ duration: 0.5, delay: 0.5 }}
              className={cx('panel', 'dark')}
              style={{ gridColumn: {
                left: 'fifth 2 / viewport-right',
                right: 'viewport-left / fifth 3',
              }[orientation] }}
            >
              <div className={cx('nav-cover')} />
              <motion.div
                className={cx('content')}
                style={{ opacity: contentOpacity, pointerEvents: menuOpen ? 'none' : 'all' }}
              >
                <FadeOnChange watch={routerPath}>{ darkContent }</FadeOnChange>
              </motion.div>
            </motion.div>
          ) }

        <div
          className={cx('menu-close-target')}
          style={{ pointerEvents: menuOpen ? 'all' : 'none' }}
          onClick={() => dispatch('setMenuOpen', false)}
          role="none"
        />

        {/* There's a menu off screen to the right */}
        <FadeOnChange watch={routerPath}>
          <Menu orientation="right" />
        </FadeOnChange>
      </motion.div>


      {/* Menu button that floats above */}
      {/*
        There are two copies of the menu button rendered.
        - The "light" copy of the menu button has an opaque white background. This background
          obscures the dark copy, and clips the light button as the menu slides open.
        - The "dark" copy of the menu button is revealed from under the light copy when the menu
          opens.
      */}

      <FadeOnChange watch={routerPath} style={{ position: 'relative', zIndex: 3 }}>
        {/* light menu button */}
        <motion.div
          className={cx('menu-button', 'light', orientationClass)}
          // This div has the light background. It slides over with the PanelsLayout when menu opens
          style={{ x }}
        >
          <motion.button
            type="button"
            // The visible text of the button slides in the opposite direction so that it stays in
            // place. However, the parent div has overflow: hidden and clips this div as it moves.
            style={{ x: inverseX }}
            onClick={() => { dispatch('setMenuOpen', !menuOpen); }}
          >
            <MenuIcon />
            <div className={cx('label')}>{ currPageName || 'Menu' }</div>
          </motion.button>
        </motion.div>
        {/* dark menu button */}
        <div
          className={cx('menu-button', 'dark', orientationClass)}
        >
          <button
            type="button"
            onClick={() => { dispatch('setMenuOpen', !menuOpen); }}
          >
            <MenuIcon />
            <div className={cx('label')}>Close</div>
          </button>
        </div>
      </FadeOnChange>

    </motion.div>
  );
}

PanelsLayout.propTypes = {
  lightContent: PropTypes.element.isRequired,
  darkContent: PropTypes.element,
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
  currPageName: PropTypes.string,
};
PanelsLayout.defaultProps = {
  darkContent: null,
  currPageName: null,
};

export default PanelsLayout;
