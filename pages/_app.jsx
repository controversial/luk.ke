import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';

import PanelsLayout from '../components/PanelsLayout/PanelsLayout.jsx';

import baseStyles from '../styles/base.sass?type=global';

function App({ Component, pageProps }) {
  return (
    <>
      <PanelsLayout orientation={Component.panelOrientation}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </PanelsLayout>

      <style jsx>{baseStyles}</style>
    </>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
App.defaultProps = { pageProps: {} };


export default App;

// Make app and router accessible globally for debugging
if (typeof window !== 'undefined') {
  window.app = App;
  window.app.router = Router;
}
