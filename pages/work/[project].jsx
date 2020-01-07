import React from 'react';
import { useRouter } from 'next/router';

import PanelsContent from '../../components/PanelsLayout/PanelsContent.jsx';

const ProjectDetails = () => {
  const router = useRouter();

  return (
    <div className="page work-case-study">
      <PanelsContent
        orientation={ProjectDetails.panelOrientation}
        lightContent={(
          <div>
            <h1>
              Work:&nbsp;
              {router.query.project}
            </h1>
          </div>
        )}
      />
    </div>

  );
};

ProjectDetails.panelOrientation = 'full';

export default ProjectDetails;
