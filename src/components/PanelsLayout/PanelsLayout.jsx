import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../../store';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import Menu from '../Menu/Menu.jsx';
import MenuIcon from '../NavBar/MenuIcon.jsx';

import getOrientationClass from '../../helpers/getOrientationClass';

import styles from './PanelsLayout.module.sass';

/**
 * This component provides a layout with four full-height sections: a light colored panel with
 * fixed-position content, a dark section behind/to the side of the light panel with scrolling
 * content, and a menu component off screen to each side.
 */

function PanelsLayout({ lightContent, darkContent, orientation, currPageName }) {
  // Whether or not the menu is open is recorded in the global application store
  const { state: { menuOpen, dimensions }, dispatch } = useStore();
  const orientationClass = getOrientationClass(orientation);

  const variant = menuOpen ? 'menu-open' : 'menu-closed';

  // This is the amount the whole panels container is transformed by when opening/closing the menu
  const x = useMotionValue(0);
  const inverseX = useTransform(x, (val) => val * -1);

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
        className={`${styles.panelsLayout} ${styles[orientationClass]} ${menuOpen ? styles.menuOpen : ''}`}
        style={{ x }}
        variants={{
          'menu-open': { x: orientation === 'right' ? `-${dimensions.menuWidth}` : dimensions.menuWidth },
          'menu-closed': { x: 0 },
        }}
        transition={{ type: 'tween', duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* There's a menu off screen to the left */}
        <Menu orientation="left" />

        {/* Light panel */}
        <motion.div
          layoutTransition
          className={`${styles.panel} ${styles.light}`}
          style={{ gridColumn: {
            left: 'viewport-left / fifth 2',
            right: 'fifth 3 / viewport-right',
            full: 'viewport-left / viewport-right',
          }[orientation] }}
        >
          <div className={styles.navCover} />
          <div className={styles.content}>{lightContent}</div>
        </motion.div>

        {/* Dark content sits "behind" and to the side of right panel */}
        { orientation === 'full' ? <React.Fragment />
          : (
            <motion.div
              layoutTransition
              className={`${styles.panel} ${styles.dark}`}
              style={{ gridColumn: {
                left: 'fifth 2 / viewport-right',
                right: 'viewport-left / fifth 3',
              }[orientation] }}
            >
              <div className={styles.navCover} />
              <div className={styles.content}>{darkContent}</div>
            </motion.div>
          ) }

        {/* There's a menu off screen to the right */}
        <Menu orientation="right" />
      </motion.div>


      {/* Menu button that floats above */}
      {/*
        There are two copies of the menu button rendered.
        - The "light" copy of the menu button has an opaque white background. This background
          obscures the dark copy, and clips the light button as the menu slides open.
        - The "dark" copy of the menu button is revealed from under the light copy when the menu
          opens.
      */}

      {/* light menu button */}
      <motion.div
        className={`${styles.menuButton} ${styles.light} ${styles[orientationClass]}`}
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
          <div className={styles.label}>{ currPageName }</div>
        </motion.button>
      </motion.div>
      {/* dark menu button */}
      <div
        className={`${styles.menuButton} ${styles.dark} ${styles[orientationClass]}`}
      >
        <button
          type="button"
          onClick={() => { dispatch('setMenuOpen', !menuOpen); }}
        >
          <MenuIcon />
          <div className={styles.label}>Close</div>
        </button>
      </div>

    </motion.div>
  );
}

PanelsLayout.propTypes = {
  lightContent: PropTypes.element.isRequired,
  darkContent: PropTypes.element,
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
  currPageName: PropTypes.string.isRequired,
};
PanelsLayout.defaultProps = { darkContent: null };

export default PanelsLayout;
