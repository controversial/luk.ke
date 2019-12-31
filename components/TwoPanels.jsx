import React from 'react';
import PropTypes from 'prop-types';

import styles from './TwoPanels.sass';


/* eslint-disable react/prefer-stateless-function */

class TwoPanels extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  }

  render() {
    const { children } = this.props;
    return (
      <div className="panel-layout">
        { React.Children.only(children) }

        <style jsx>{ styles }</style>
      </div>
    );
  }
}

export default TwoPanels;
