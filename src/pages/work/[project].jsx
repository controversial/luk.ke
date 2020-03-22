import React from 'react';
import { useRouter } from 'next/router';

function CaseStudy() {
  const router = useRouter();

  return (
    <div className="page work-case-study">
      <h1>
        Work:&nbsp;
        {router.query.project}
      </h1>
    </div>
  );
}

Object.assign(CaseStudy, {
  pageName: 'Work',
});

export default CaseStudy;
