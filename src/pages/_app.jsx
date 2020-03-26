import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';

import mitt from 'mitt';
import { StoreProvider } from '../store';

import PanelsLayout from '../components/PanelsLayout/PanelsLayout.jsx';

import '../styles/base.sass';


function App({ Component, pageProps: basePageProps }) {
  const { panelOrientation: pagePanelOrientation, pageName: initialPageName } = Component;

  const [pageName, setPageName] = useState(initialPageName);
  // This event emitter is passed to both LightContent and DarkContent and can be used to pass data
  // between the two when necessary
  const [bus] = useState(mitt());

  // When we get to a new page, update the page name stored in state
  useEffect(() => {
    const updatePageName = () => { setPageName(Component.pageName); };
    Router.events.on('routeChangeComplete', updatePageName);
    return () => { Router.events.off('routeChangeComplete', updatePageName); };
  }, []);

  const pprops = { ...basePageProps, setPageName, bus };

  return (
    <StoreProvider>
      <div id="app">
        <PanelsLayout
          // Well-behaved page components should define LightContent and DarkContent as properties,
          // but pages that don't do this will still be rendered as full-screen "light" content
          lightContent={React.createElement(Component.LightContent || Component, pprops)}
          darkContent={Component.DarkContent && React.createElement(Component.DarkContent, pprops)}
          // If the component does not provide both light content and dark content, force the "full"
          // layout.
          orientation={(Component.LightContent && Component.DarkContent) ? pagePanelOrientation : 'full'}
          currPageName={pageName}
        />

        {/*
          If the page component provides LightContent, then the main Component won't get rendered in
          PanelsLayout. Whenever this is the case, we elect to render in the main app container
          instead. In most cases, Component won't render real DOM content.
        */}
        { Component.LightContent ? <Component {...pprops} /> : '' }
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
