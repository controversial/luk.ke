import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../../store';

import Menu from '../Menu/Menu.jsx';

import styles from './PanelsLayout.sass';


export function getOrientationClass(orientation) {
  return ({
    left: 'panel-on-left',
    right: 'panel-on-right',
    full: 'panel-full',
  })[orientation];
}

/**
 * This component provides a layout with three full-height panels: a light colored panel with fixed-
 * position content, a dark-colored panel with scrolling content, and a menu component as a third
 * panel.
 */

function PanelsLayout({ children, orientation }) {
  const { state: { menuOpen }, dispatch } = useStore();
  const orientationClass = getOrientationClass(orientation);

  return (
    <div
      role="none"
      className={`panels-layout ${orientationClass} ${menuOpen ? 'menu-open' : ''}`}
      onClick={() => dispatch('setMenuOpen', false)}
    >
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
};

export default PanelsLayout;
