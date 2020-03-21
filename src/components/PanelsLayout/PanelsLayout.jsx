import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../../store';

import { motion } from 'framer-motion';
import Menu from '../Menu/Menu.jsx';

import getOrientationClass from '../../helpers/getOrientationClass';

import styles from './PanelsLayout.sass?type=global';

/**
 * This component provides a layout with four full-height sections: a light colored panel with
 * fixed-position content, a dark section behind/to the side of the light panel with scrolling
 * content, and a menu component off screen to each side.
 */

function PanelsLayout({ lightContent, darkContent, orientation, currPageName }) {
  // Whether or not the menu is open is recorded in the global application store
  const { state: { menuOpen }, dispatch } = useStore();
  const orientationClass = getOrientationClass(orientation);

  return (
    <motion.div
      className={`panels-layout ${orientationClass} ${menuOpen ? 'menu-open' : ''}`}
      animate={menuOpen ? 'menu-open' : 'menu-closed'}
      initial={false}
    >
      <Menu orientation="left" />

      <div className="panel light">{lightContent}</div>
      <div className="dark-content">{darkContent}</div>

      <Menu orientation="right" />

      <style jsx>{ styles }</style>
    </motion.div>
  );
}

PanelsLayout.propTypes = {
  lightContent: PropTypes.element.isRequired,
  darkContent: PropTypes.element.isRequired,
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
  currPageName: PropTypes.string.isRequired,
};

export default PanelsLayout;
