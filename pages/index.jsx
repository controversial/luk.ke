import React from 'react';
import Link from 'next/link';

import styles from './index.sass';

class Index extends React.Component {
  static panelOrientation = 'right';

  render() {
    return (
      <div className="page home" data-panel-orientation="right">
        <h1 className="heading-main">Luke Deen Taylor</h1>
        <Link href="/work/[project]" as="work/codus"><a>Codus</a></Link>

        <style jsx>{styles}</style>
      </div>
    );
  }
}

export default Index;
