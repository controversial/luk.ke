import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../../store';

import { motion } from 'framer-motion';
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

  return (
    <React.Fragment>
      {/* Menu button that floats above */}
      <div className={`${styles.menuButton} ${styles[orientationClass]}`}>
        <motion.button
          type="button"
          onClick={() => { dispatch('setMenuOpen', !menuOpen); }}
          animate={variant}
          initial={false}
        >
          <MenuIcon />
          <div className={styles.label}>{ currPageName }</div>
        </motion.button>
      </div>

      {/*
        The main panels container. Displays a dark and light panel that fill up the whole viewport,
        as well as a menu to the left and the right. This whole container shifts to the left/right
        to reveal the menu.
      */}
      <motion.div
        className={`${styles.panelsLayout} ${styles[orientationClass]} ${menuOpen ? styles.menuOpen : ''}`}
        variants={{
          'menu-open': (orient) => ({ x: orient === 'right' ? `-${dimensions.menuWidth}` : dimensions.menuWidth }),
          'menu-closed': { x: 0 },
        }}
        animate={variant}
        transition={{ type: 'tween', duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        custom={orientation}
        initial={false}
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
    </React.Fragment>
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
