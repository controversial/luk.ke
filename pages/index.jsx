import React from 'react';

import styles from './index.sass';

class Index extends React.Component {
  static panelOrientation = 'right';

  render() {
    return (
      <div className="page home">
        <div className="left">
          <h1 className="heading-main">Luke Deen Taylor</h1>
        </div>

        <style jsx>{styles}</style>
      </div>
    );
  }
}

export default Index;
