import React from 'react';
import PropTypes from 'prop-types';

import MenuIcon from './MenuIcon.jsx';

import { useStore } from '../../store';
import getOrientationClass from '../../helpers/getOrientationClass';

import styles from './NavBar.sass';


function NavBar({ orientation, panelWidth, currPageName }) {
  const { state: { menuOpen }, dispatch } = useStore();

  return (
    <div
      className={`nav-bar ${getOrientationClass(orientation)} ${menuOpen ? 'menu-open' : ''}`}
    >
      {/* One side of the nav bar contains a white background, which displays a dark-colored button
          to open the menu. */}
      <div className="panel" style={{ width: panelWidth }}>
        <button
          type="button"
          className="menu-button"
          onClick={() => { dispatch('setMenuOpen', !menuOpen); }}
        >
          <MenuIcon menuOpen={menuOpen} />
          <div className="label">{ currPageName }</div>
        </button>
      </div>

      {/* Behind the white panel there's another button on a dark background to close the menu */}
      <button
        type="button"
        className="menu-button back"
        onClick={() => { dispatch('setMenuOpen', !menuOpen); }}
      >
        <MenuIcon menuOpen={menuOpen} />
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
