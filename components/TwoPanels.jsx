import React from 'react';
import PropTypes from 'prop-types';

import styles from './TwoPanels.sass';


/* eslint-disable react/prefer-stateless-function */

class TwoPanels extends React.Component {
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
      <div className={`panel-layout ${orientationClass}`}>
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

export default TwoPanels;
