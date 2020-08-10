import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import parse from 'html-react-parser';

import { getHomepage } from 'pages/api/content/hello';

import Head from 'next/head';
import { useRouter } from 'next/router';

import AgeCounter from 'components/AgeCounter/AgeCounter.jsx';
import OverscrollTrigger from 'components/OverscrollTrigger';

import styles from './index.module.sass';
const cx = classNames.bind(styles);


// Replacement function for html-react-parser. If we encounter an element with class name 'age', we
// replace it with an instance of AgeCounter
// eslint-disable-next-line react/prop-types
const replaceAge = ({ attribs }) => attribs?.['class'] === 'age' && <AgeCounter className={cx('age')} />;


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

function HomepageLightContent() {
  return (
    <div>
      <div className={cx('gradient')} />
    </div>
  );
}

// Content to go in the dark section

function HomepageDarkContent({ content, setWillNavigate }) {
  const router = useRouter();

  return (
    <div className={cx('content-wrapper')}>
      { parse(content.title) }
      {
        content.text.map((p) => (
          <React.Fragment key={p}>
            { parse(p, { replace: replaceAge }) }
          </React.Fragment>
        ))
      }

      <OverscrollTrigger
        callback={() => { router.push('/work'); }}
        preCallback={(willNav) => setWillNavigate(willNav)}
      />
    </div>
  );
}

HomepageDarkContent.propTypes = {
  content: PropTypes.exact({
    title: PropTypes.string.isRequired,
    text: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  setWillNavigate: PropTypes.func.isRequired,
};


// Define everything that needs to be a property of the exported component

Object.assign(Hello, {
  LightContent: HomepageLightContent,
  DarkContent: HomepageDarkContent,
  pageName: 'Hello',
  panelOrientation: 'right',
});

export async function getStaticProps() {
  return {
    props: { content: await getHomepage(true) },
    revalidate: 60, // fetch new CMS data in the background if it's been more than a minute
  };
}


export default Hello;
