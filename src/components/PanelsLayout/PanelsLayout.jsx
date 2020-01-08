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
 * This component provides a layout with multiple panels: a light colored panel with fixed content,
 * a dark-colored panel with scrolling content, and TODO: a menu component as a third panel on the
 * opposite side of the fixed light panel from the scrolling dark panel.
 */

function PanelsLayout({ children, orientation }) {
  const { state: { menuOpen } } = useStore();
  const orientationClass = getOrientationClass(orientation);

  return (
    <div className={`panels-layout ${orientationClass} ${menuOpen ? 'menu-open' : ''}`}>
      <div className="panels-background">
        <div className="panel-bg light" />
        <div className="panel-bg dark" />
      </div>

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
