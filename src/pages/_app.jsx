import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';

import NavBar from '../components/NavBar/NavBar.jsx';
import PanelsLayout from '../components/PanelsLayout/PanelsLayout.jsx';

import baseStyles from '../styles/base.sass?type=global';

function App({ Component, pageProps }) {
  const { panelOrientation, pageName: initialPageName } = Component;

  const [pageName, setPageName] = useState(initialPageName);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div id="app">
      <NavBar
        currPageName={pageName}
        orientation={panelOrientation}
        panelWidth="40vw"
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <PanelsLayout
        orientation={Component.panelOrientation}
        menuOpen={menuOpen}
      >
        {/* eslint-disable react/jsx-props-no-spreading */}
        <Component
          {...pageProps}
          setPageName={setPageName}
        />
        {/* eslint-enable */}
      </PanelsLayout>

      <style jsx>{baseStyles}</style>
    </div>
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
