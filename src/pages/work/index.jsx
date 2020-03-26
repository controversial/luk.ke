import React from 'react';
import PropTypes from 'prop-types';

import { getProjects } from '../api/content/work';

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
LightContent.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape({
    uid: PropTypes.string.isRequired,
    head: PropTypes.string.isRequired,
    featured_images: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
};


function DarkContent() {
  return <div />;
}
DarkContent.propTypes = LightContent.propTypes;


Object.assign(WorkIndex, {
  LightContent,
  DarkContent,
  pageName: 'Work',
  panelOrientation: 'left',

  async getInitialProps(ctx) {
    return { content: await getProjects(ctx.req) };
  },
});

export default WorkIndex;
