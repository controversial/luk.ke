import React from 'react';

import Head from 'next/head';

/**
 * Page listing brief details/images for many of my projects, which allows navigation to case
 * studies.
 */

// Main component configures page metadata and doesn't redner anything

function WorkIndex() {
  return (
    <React.Fragment>
      <Head>
        <title>Work | Luke Deen Taylor</title>
      </Head>
    </React.Fragment>
  );
}


// Content to go in the dark section
function LightContent() {
  return (
    <div>
      <h2>Project Name</h2>
    </div>
  );
}

function DarkContent() {
  return <div />;
}

Object.assign(WorkIndex, {
  LightContent,
  DarkContent,
  pageName: 'Work',
  panelOrientation: 'left',
});

export default WorkIndex;
