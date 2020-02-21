import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../../store';

import getOrientationClass from '../../helpers/getOrientationClass';


import styles from './PanelsContent.sass';

/**
 * Provides appropriate layout/styles for content to sit in front of PanelsLayout
 */
function PanelsContent({ orientation, darkContent, lightContent }) {
  const { state: { menuOpen } } = useStore();
  const orientationClass = getOrientationClass(orientation);

  return (
    <div className={`panels-content-layout ${orientationClass} ${menuOpen ? 'menu-open' : ''}`}>

      <div className="dark container">
        <div className="dark content">
          {darkContent}
        </div>
      </div>

      <div className="light container">
        <div className="light content">
          {lightContent}
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

PanelsContent.propTypes = {
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
  darkContent: PropTypes.element,
  lightContent: PropTypes.element,
};

PanelsContent.defaultProps = {
  darkContent: null,
  lightContent: null,
};

export default PanelsContent;
