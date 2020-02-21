import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../../store';

import { motion } from 'framer-motion';
import Menu from '../Menu/Menu.jsx';
import NavBar from '../NavBar/NavBar.jsx';

import getOrientationClass from '../../helpers/getOrientationClass';

import styles from './PanelsLayout.sass?type=global';

/**
 * This component provides a layout with three full-height sections: a light colored panel with
 * fixed- position content, a dark section behind/to the side of the light panel with scrolling
 * content, and a menu component off screen to one side.
 */

function PanelsLayout({ children, orientation, currPageName }) {
  const { state: { menuOpen }, dispatch } = useStore();
  const orientationClass = getOrientationClass(orientation);

  return (
    <motion.div
      className={`panels-layout ${orientationClass} ${menuOpen ? 'menu-open' : ''}`}
      animate={menuOpen ? 'menu-open' : 'menu-closed'}
      initial={false}
    >
      <NavBar
        currPageName={currPageName}
        orientation={orientation}
        panelWidth="40vw"
      />

      {/* Adds a light-colored background to the panel */}
      <div className="panel-bg" />

      <div className="panels-content">
        { React.Children.only(children) }
      </div>

      <Menu orientation={orientation} />

      <div
        role="none"
        className="menu-close-target"
        onClick={() => dispatch('setMenuOpen', false)}
      />

      <style jsx>{ styles }</style>
    </motion.div>
  );
}

PanelsLayout.propTypes = {
  children: PropTypes.element.isRequired,
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
  currPageName: PropTypes.string.isRequired,
};

export default PanelsLayout;
