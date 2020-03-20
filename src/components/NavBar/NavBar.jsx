import React from 'react';
import PropTypes from 'prop-types';

import { motion } from 'framer-motion';
import MenuIcon from './MenuIcon.jsx';

import { useStore } from '../../store';
import getOrientationClass from '../../helpers/getOrientationClass';

import styles from './NavBar.sass';


const navPadding = 60; // px
const panelWidth = 40; // vw

const panelVariants = {
  'menu-closed': ({ orientation }) => ({
    x: orientation !== 'right' ? '0vw' : '100vw',
    scaleX: orientation !== 'full' ? 1 : (100 / panelWidth),
    padding: orientation !== 'full'
      ? `0 ${navPadding}px`
      : `0 ${navPadding / (100 / panelWidth)}px`,
  }),
};


function NavBar({ orientation, panelWidth, currPageName }) {
  const { state: { menuOpen }, dispatch } = useStore();

  return (
    <div
      className={`nav-bar ${getOrientationClass(orientation)} ${menuOpen ? 'menu-open' : ''}`}
    >
      {/* One side of the nav bar contains a white background, which displays a dark-colored button
          to open the menu. */}
      <motion.div
        className="panel"
        variants={panelVariants}
        animate={{
          transitionEnd: {
            'justify-content': orientation === 'right' ? 'flex-end' : 'flex-start'
          }
        }}
        custom={{ orientation, panelWidth }}
        style={{ width: panelWidth }}
      >
        <motion.button
          type="button"
          className="menu-button"
          onClick={() => { dispatch('setMenuOpen', !menuOpen); }}
        >
          <MenuIcon />
          <div className="label">{ currPageName }</div>
        </motion.button>
      </motion.div>

      {/* Behind the white panel there's another button on a dark background to close the menu */}
      <button
        type="button"
        className="menu-button back"
        onClick={() => { dispatch('setMenuOpen', !menuOpen); }}
      >
        <MenuIcon />
        <div className="label">Close</div>
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
