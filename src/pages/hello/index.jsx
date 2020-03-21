import React from 'react';
import PropTypes from 'prop-types';

import parse from 'html-react-parser';

import { getHomepage } from '../api/content/hello';

import Head from 'next/head';
import AgeCounter from '../../components/AgeCounter/AgeCounter.jsx';


// Replacement function for html-react-parser. If we encounter an element with class name 'age', we
// replace it with an instance of AgeCounter
// eslint-disable-next-line react/prop-types
const replaceAge = ({ attribs }) => attribs?.['class'] === 'age' && <AgeCounter />;


// Main component - configures page metadata and doesn't render anything

function Hello() {
  return (
    <React.Fragment>
      <Head>
        <title>Luke Deen Taylor</title>
      </Head>
    </React.Fragment>
  );
}

// Content to go in the light section

function LightContent() {
  return (
    <div>
      <div className="gradient" />
    </div>
  );
}

// Content to go in the dark section

function DarkContent({ content }) {
  return (
    <div className="content-wrapper">
      { parse(content.title) }
      {
        content.text.map((p) => (
          <React.Fragment key={p}>
            { parse(p, { replace: replaceAge }) }
          </React.Fragment>
        ))
      }
    </div>
  );
}

DarkContent.propTypes = {
  content: PropTypes.exact({
    title: PropTypes.string.isRequired,
    text: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};


// Define everything that needs to be a property of the exported component

Object.assign(Hello, {
  LightContent,
  DarkContent,
  pageName: 'Hello',
  panelOrientation: 'right',

  async getInitialProps(ctx) {
    return { content: await getHomepage(ctx.req) };
  },
});


export default Hello;
