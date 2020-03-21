import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';

import { StoreProvider } from '../store';

import PanelsLayout from '../components/PanelsLayout/PanelsLayout.jsx';

import baseStyles from '../styles/base.sass?type=global';


function App({ Component, pageProps: basePageProps }) {
  const { panelOrientation, pageName: initialPageName } = Component;

  const [pageName, setPageName] = useState(initialPageName);
  Router.events.on('routeChangeComplete', () => { setPageName(Component.pageName); });

  const pageProps = { ...basePageProps, setPageName };

  return (
    <StoreProvider>
      <div id="app">
        <PanelsLayout
          // Well-behaved page components should define LightContent and DarkContent as properties,
          // but pages that don't do this will still be rendered as full-screen "light" content
          lightContent={React.createElement(Component.LightContent || Component, pageProps)}
          darkContent={React.createElement(Component.DarkContent || React.Fragment, pageProps)}
          // If the component does not provide both light content and dark content, force the "full"
          // layout.
          orientation={(Component.LightContent && Component.DarkContent) ? panelOrientation : 'full'}
          currPageName={pageName}
        />

        {/*
          If the page component provides LightContent, then the main Component won't get rendered in
          PanelsLayout. Whenever this is the case, we elect to render in the main app container
          instead. In most cases, it won't render real DOM content.
        */}
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        { Component.LightContent ? <Component {...pageProps} /> : '' }

        <style jsx>{baseStyles}</style>
      </div>
    </StoreProvider>
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
