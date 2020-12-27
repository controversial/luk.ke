import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Router, { useRouter } from 'next/router';
import Head from 'next/head';

import mitt from 'mitt';
import { StoreProvider } from '../store';

import { Responsive, MediaQuery } from 'components/Responsive';
import PanelsLayout from 'components/PanelsLayout';
import MobileLayout from 'components/MobileLayout';

import setSafariScrollFix from '../safari-scroll-fix';
import '../console-message';

import '../styles/base.sass';


function App({ Component, pageProps: basePageProps }) {
  // Unpack the configuration options that attach to the Component function
  const {
    panelOrientation: pagePanelOrientation,
    pageName: initialPageName,
    missingH1: componentIsMissingH1,
  } = Component;

  // Enable fix for Safari overscroll behavior
  useEffect(setSafariScrollFix, []);

  // The pageName starts out with the value attached to the Component, but it can be changed!
  const [pageName, setPageName] = useState(initialPageName);

  // This event emitter is passed to both LightContent and DarkContent and can be used to pass data
  // between the two when necessary
  const [bus] = useState(mitt());

  // Pages can notify PanelsLayout when they think they are going to perform imperative navigation
  const [willNavigate, setWillNavigate] = useState(false);

  // When we get to a new page, update the page name stored in state
  const router = useRouter();
  const isFirstUpdate = useRef(true);
  useEffect(() => {
    if (isFirstUpdate.current) isFirstUpdate.current = false;
    else {
      const newComponent = router.components[router.pathname]?.Component;
      if (newComponent) setPageName(newComponent.pageName);
    }
  }, [router.route]);
  useEffect(() => {
    const reset = () => setWillNavigate(false);
    router.events.on('routeChangeComplete', reset);
    return () => router.events.off('routeChangeComplete', reset);
  }, []);

  const pprops = { ...basePageProps, setPageName, bus, setWillNavigate };

  return (
    <StoreProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </Head>
      <div id="app">
        <Responsive>
          <MediaQuery query="landscape">
            <PanelsLayout
              // Well-behaved page components should define LightContent and DarkContent as
              // properties, but pages that don't do this will still be rendered as full-screen
              // "light" content
              lightContent={
                React.createElement(Component.LightContent || Component, pprops)
              }
              darkContent={
                Component.DarkContent && React.createElement(Component.DarkContent, pprops)
              }
              // If the component does not provide both light content and dark content, force the
              // "full" layout.
              orientation={(Component.LightContent && Component.DarkContent)
                ? pagePanelOrientation
                : 'full'}
              currPageName={pageName}
              // PanelsLayout should provide an h1 element if the page component says it's missing
              // that
              provideH1={componentIsMissingH1}
              // We can notify PanelsLayout when we think navigation is going to occur
              willNavigate={willNavigate}
            />

            {/*
              If the page component provides LightContent, then the main Component won't get
              rendered in PanelsLayout. Whenever this is the case, we elect to render in the main
              app container instead. In most cases, Component won't render real DOM content.
            */}
            { Component.LightContent ? <Component {...pprops} /> : '' }
          </MediaQuery>
          <MediaQuery query="portrait">
            <MobileLayout
              // For mobile layout, we prefer the dark content (on a dark background) and use the
              // light content (which is required for all pages) as a background. In practice, the
              // light content pops up on pages whose PanelLayout layout is 'full'
              content={React.createElement(
                Component.DarkContent || Component.LightContent || Component,
                pprops,
              )}
              // We know we're using the light content if there is no dark content
              isLight={!Component.DarkContent}
              currPageName={pageName}
              provideH1={componentIsMissingH1}
            />
            {/* Make sure main Component gets a chance to render */}
            { (Component.DarkContent || Component.LightContent) ? <Component {...pprops} /> : '' }
          </MediaQuery>
        </Responsive>
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
