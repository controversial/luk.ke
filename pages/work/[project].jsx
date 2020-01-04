import React from 'react';
import { useRouter } from 'next/router';

const ProjectDetails = () => {
  const router = useRouter();

  return (
    <h1>
      Work:&nbsp;
      {router.query.project}
    </h1>
  );
};

ProjectDetails.panelOrientation = 'full';

export default ProjectDetails;
