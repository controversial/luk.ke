import React from 'react';

import Head from 'next/head';
import PanelsContent from '../../components/PanelsLayout/PanelsContent.jsx';

/**
 * Page listing brief details/images for many of my projects, and linking to fuller descriptions
 */
const WorkIndex = () => (
  <div className="page work-index">
    <Head>
      <title>Work | Luke Deen Taylor</title>
    </Head>

    <PanelsContent
      orientation={WorkIndex.panelOrientation}
      lightContent={(
        <div>
          <h2>Project Name</h2>
        </div>
      )}
    />

  </div>
);

Object.assign(WorkIndex, {
  pageName: 'Work',
  panelOrientation: 'left',
});

export default WorkIndex;
