import React from 'react';
import DefaultApp from 'next/app';
import Router from 'next/router';

import PanelsLayout from '../components/PanelsLayout/PanelsLayout.jsx';

import baseStyles from '../styles/base.sass?type=global';

class App extends DefaultApp {
  render() {
    const { Component, pageProps } = this.props;

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
}

export default App;

// Make app and router accessible globally for debugging
if (typeof window !== 'undefined') {
  window.app = App;
  window.app.router = Router;
}
