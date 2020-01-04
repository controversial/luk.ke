import React from 'react';
import DefaultApp from 'next/app';
import Router from 'next/router';

import PanelsLayout from '../components/PanelsLayout.jsx';

class App extends DefaultApp {
  render() {
    const { Component, pageProps } = this.props;

    return (
      <PanelsLayout orientation={Component.panelOrientation}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </PanelsLayout>
    );
  }
}

export default App;

// Make app and router accessible globally for debugging
if (typeof window !== 'undefined') {
  window.app = App;
  window.app.router = Router;
}
