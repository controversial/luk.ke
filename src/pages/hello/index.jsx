import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import parse from 'html-react-parser';

import { getHomepage } from 'pages/api/content/hello';

import Meta from 'components/Meta/Meta';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMatchedMedia } from 'components/Responsive';

import Headshot from 'components/Headshot';
import AgeCounter from 'components/AgeCounter';
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
    <Meta
      title="Hello"
      description="Luke is a creative developer. He designs unique web-based experiences and brings them to life."
      path="/hello"
      canonicalPath="/"
    />
  );
}

// Content to go in the light section (on desktop only)

function HomepageLightContent({ content: { hero_image: heroImage } }) {
  return (
    <Link href="/contact">
      <a className={cx('image-wrapper')}>
        <Headshot
          image={heroImage}
          // When the PanelsLayout splits 50/50, width is at _most_ a little less than 82% of 50vw
          // Otherwise, we width is at _most_ a little less than 82% of 40vw
          sizes="(max-aspect-ratio: 4/3) 41vw, 32vw"
        />
      </a>
    </Link>
  );
}
HomepageLightContent.propTypes = {
  content: PropTypes.shape({
    hero_image: PropTypes.shape({ /* Defined more in Headshot PropTypes */ }).isRequired,
  }).isRequired,
};

// Content to go in the dark section

function HomepageDarkContent({ content, setWillNavigate }) {
  const router = useRouter();
  const routerRef = useRef();
  routerRef.current = router;
  // Callback functions for OverscrollTrigger
  const osCallback = useCallback(() => { routerRef.current.push('/work'); }, []);
  const osPreCallback = useCallback((willNav) => setWillNavigate(willNav), [setWillNavigate]);

  const isMobile = useMatchedMedia().includes('portrait');


  const textBlocks = content.text.map((p) => (
    <React.Fragment key={p}>
      { parse(p, { replace: replaceAge }) }
    </React.Fragment>
  ));

  return (
    <div className={cx('content-wrapper', { mobile: isMobile })}>
      {/* The heading and first block of text go in the "first content" wrapper div */}
      <div className={cx('first-content')}>
        <div className={cx('text')}>
          { parse(content.title) }
          { textBlocks[0] }
        </div>

        {/* On mobile, we put them side by side with my picture */}
        {isMobile && (
          <div className={cx('mobile-headshot')}>
            <div>
              <Headshot image={content.hero_image} objectFit="cover" sizes="50vw" />
            </div>
          </div>
        )}
      </div>

      {/* The rest of the content blocks go below */}
      {textBlocks.slice(1)}

      {isMobile ? (
        <div className={cx('swipe-instructions')}>
          Swipe left and right to see more
        </div>
      ) : (
        <OverscrollTrigger callback={osCallback} preCallback={osPreCallback} />
      )}
    </div>
  );
}

HomepageDarkContent.propTypes = {
  content: PropTypes.shape({
    title: PropTypes.string.isRequired,
    text: PropTypes.arrayOf(PropTypes.string).isRequired,
    hero_image: PropTypes.shape({}).isRequired,
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
