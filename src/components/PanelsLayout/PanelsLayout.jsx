import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../../store';

import Menu from '../Menu/Menu.jsx';
import NavBar from '../NavBar/NavBar.jsx';

import getOrientationClass from '../../helpers/getOrientationClass';

import styles from './PanelsLayout.sass';

/**
 * This component provides a layout with three full-height panels: a light colored panel with fixed-
 * position content, a dark-colored panel with scrolling content, and a menu component as a third
 * panel.
 */

function PanelsLayout({ children, orientation, currPageName }) {
  const { state: { menuOpen }, dispatch } = useStore();
  const orientationClass = getOrientationClass(orientation);

  return (
    <div
      className={`panels-layout ${orientationClass} ${menuOpen ? 'menu-open' : ''}`}
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

      <style jsx>{ styles }</style>
    </div>
  );
}

PanelsLayout.propTypes = {
  children: PropTypes.element.isRequired,
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
  currPageName: PropTypes.string.isRequired,
};

export default PanelsLayout;
