import React from 'react';

import PanelsContent from '../../components/PanelsLayout/PanelsContent.jsx';

/**
 * Page listing brief details/images for many of my projects, and linking to fuller descriptions
 */
const WorkIndex = () => (
  <div className="page work-index">

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

WorkIndex.pageName = 'Work';
WorkIndex.panelOrientation = 'left';

export default WorkIndex;
