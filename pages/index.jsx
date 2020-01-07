import React from 'react';

import PanelsContent from '../components/PanelsLayout/PanelsContent.jsx';

import styles from './index.sass';

class Index extends React.Component {
  static panelOrientation = 'right';

  render() {
    return (
      <div className="page home">

        <PanelsContent
          orientation={Index.panelOrientation}
          darkContent={(
            <div>
              <h1 className="heading-main">Hi, I&rsquo;m Luke!</h1>
            </div>
          )}
          lightContent={(
            <div>
              <div className="gradient" />
            </div>
          )}
        />

        <style jsx>{styles}</style>
      </div>
    );
  }
}

export default Index;
