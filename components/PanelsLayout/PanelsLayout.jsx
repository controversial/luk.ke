/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import PropTypes from 'prop-types';

import styles from './PanelsLayout.sass';


/**
 * This component provides a layout with multiple panels: a light colored panel with fixed content,
 * a dark-colored panel with scrolling content, and TODO: a menu component as a third panel on the
 * opposite side of the fixed light panel from the scrolling dark panel.
 */

class PanelsLayout extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
  }

  render() {
    const { children, orientation } = this.props;
    const orientationClass = ({
      left: 'panel-on-left',
      right: 'panel-on-right',
      full: 'panel-full',
    })[orientation];

    return (
      <div className={`panels-layout ${orientationClass}`}>
        <div className="panels-background">
          <div className="panel-bg light" />
          <div className="panel-bg dark" />
        </div>

        <div className="panels-content">
          { React.Children.only(children) }
        </div>

        <style jsx>{ styles }</style>
      </div>
    );
  }
}

export default PanelsLayout;
