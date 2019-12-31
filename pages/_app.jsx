import React from 'react';
import DefaultApp from 'next/app';

import TwoPanels from '../components/TwoPanels.jsx';

class App extends DefaultApp {
  render() {
    const { Component, pageProps } = this.props;

    return (
      <TwoPanels orientation={Component.panelOrientation}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </TwoPanels>
    );
  }
}

export default App;
