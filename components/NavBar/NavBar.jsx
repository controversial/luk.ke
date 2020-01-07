import React from 'react';
import PropTypes from 'prop-types';

import { getOrientationClass } from '../PanelsLayout/PanelsLayout.jsx';

function NavBar({ orientation, panelWidth, currPageName, menuOpen, setMenuOpen }) {
  return (
    <div className={`nav-bar ${getOrientationClass(orientation)}`}>
      <div className="panel-bg light" style={{ width: panelWidth }}>
        {/* Button to toggle the menu */}
        <button
          type="button"
          className={`menu-button ${menuOpen ? 'menu-open' : ''}`}
          onClick={() => { setMenuOpen(!menuOpen); }}
        >
          {currPageName}
        </button>
      </div>
    </div>
  );
}

NavBar.propTypes = {
  currPageName: PropTypes.string.isRequired,
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
  panelWidth: PropTypes.string.isRequired,
  menuOpen: PropTypes.bool.isRequired,
  setMenuOpen: PropTypes.func.isRequired,
};


export default NavBar;
