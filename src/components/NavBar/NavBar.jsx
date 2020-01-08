import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../../store';

import { getOrientationClass } from '../PanelsLayout/PanelsLayout.jsx';

import styles from './NavBar.sass';

function NavBar({ orientation, panelWidth, currPageName }) {
  const { state: { menuOpen }, dispatch } = useStore();

  return (
    <div className={`nav-bar ${getOrientationClass(orientation)} ${menuOpen ? 'menu-open' : ''}`}>
      <div className="panel-bg light" style={{ width: panelWidth }} />
      {/* Button to toggle the menu */}
      <button
        type="button"
        className="menu-button"
        onClick={() => { dispatch({ type: 'setMenuOpen', payload: !menuOpen }); }}
      >
        {menuOpen ? 'Close' : currPageName}
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
