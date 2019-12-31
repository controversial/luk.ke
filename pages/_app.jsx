import React from 'react';
import DefaultApp from 'next/app';

class App extends DefaultApp {
  render() {
    const { Component, pageProps } = this.props;
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component {...pageProps} />;
  }
}

export default App;
