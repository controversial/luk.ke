import React from 'react';
import PropTypes from 'prop-types';

import { motion } from 'framer-motion';

import { useStore } from '../../store';

import { getOrientationClass } from '../PanelsLayout/PanelsLayout.jsx';

import styles from './NavBar.sass';


function icon(menuOpen) {
  // const transition = {
  //   type: 'tween',
  //   duration: 0.35,
  //   ease: 'backIn',
  // };
  const transition = {
    type: 'spring',
    mass: 0.25,
    stiffness: 150,
    damping: 10,
    velocity: 0,
  };

  return (
    <div className="icon">
      <motion.div
        className="line"
        animate={{
          width: menuOpen ? '90%' : '100%',
          rotate: menuOpen ? 45 : 0,
          y: menuOpen ? 0 : '-.5em',
        }}
        initial={false}
        transition={transition}
      />
      <motion.div
        className="line"
        animate={{
          width: menuOpen ? '90%' : '100%',
          rotate: menuOpen ? -45 : 0,
          y: menuOpen ? 0 : '.5em',
        }}
        initial={false}
        transition={transition}
      />
    </div>
  );
}


function NavBar({ orientation, panelWidth, currPageName }) {
  const { state: { menuOpen }, dispatch } = useStore();

  return (
    <div className={`nav-bar ${getOrientationClass(orientation)} ${menuOpen ? 'menu-open' : ''}`}>
      <div className="panel-bg light" style={{ width: panelWidth }} />
      {/* Button to toggle the menu */}
      <button
        type="button"
        className="menu-button"
        onClick={() => { dispatch('setMenuOpen', !menuOpen); }}
      >
        { icon(menuOpen) }
        <div className="label">{menuOpen ? 'Close' : currPageName}</div>
      </button>

      <style jsx>{styles}</style>
    </div>
  );
}

NavBar.propTypes = {
  currPageName: PropTypes.string.isRequired,
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
  panelWidth: PropTypes.string.isRequired,
};


export default NavBar;
