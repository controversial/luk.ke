import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import parse from 'html-react-parser';

import { getHomepage } from 'pages/api/content/hello';

import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMatchedMedia } from 'components/Responsive';

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
    <React.Fragment>
      <Head>
        <title>Luke Deen Taylor</title>
      </Head>
    </React.Fragment>
  );
}

// Content to go in the light section

function HomepageLightContent({ content: { hero_image } }) { // eslint-disable-line camelcase
  // Display the "unfiltered" image if it exists and its aspect ratio matches that of the main
  // hero image
  const d = hero_image.dimensions;
  const d2 = hero_image.unfiltered_dimensions;
  const displayUnfilteredImage = !!hero_image.unfiltered_src && d[0] / d[1] === d2[0] / d2[1];

  return (
    <div className={cx('image-wrapper')}>
      {displayUnfilteredImage && (
        <Image
          src={hero_image.unfiltered_filename || hero_image.unfiltered_src}
          alt={hero_image.unfiltered_alt}
          layout="fill"
          objectFit="contain"
          priority
        />
      )}
      <Image
        src={hero_image.filename || hero_image.src}
        alt={hero_image.alt}
        layout="fill"
        objectFit="contain"
        priority
        // If we have an "unfiltered" version of the image, this one should fade on hover.
        className={cx({ 'fading-overlay': displayUnfilteredImage })}
      />
    </div>
  );
}
HomepageLightContent.propTypes = {
  content: PropTypes.shape({
    hero_image: PropTypes.shape({
      src: PropTypes.string.isRequired,
      filename: PropTypes.string,
      alt: PropTypes.string.isRequired,
      dimensions: PropTypes.arrayOf(PropTypes.number).isRequired,
      // Sometimes an "unfiltered" version of the image is also provided
      unfiltered_src: PropTypes.string,
      unfiltered_filename: PropTypes.string,
      unfiltered_alt: PropTypes.string,
      unfiltered_dimensions: PropTypes.arrayOf(PropTypes.number),
    }).isRequired,
  }).isRequired,
};

// Content to go in the dark section

function HomepageDarkContent({ content, setWillNavigate }) {
  const router = useRouter();
  const isMobile = useMatchedMedia().includes('portrait');

  return (
    <div className={cx('content-wrapper', { mobile: isMobile })}>
      { parse(content.title) }
      {
        content.text.map((p) => (
          <React.Fragment key={p}>
            { parse(p, { replace: replaceAge }) }
          </React.Fragment>
        ))
      }

      {!isMobile && (
        <OverscrollTrigger
          callback={() => { router.push('/work'); }}
          preCallback={(willNav) => setWillNavigate(willNav)}
        />
      )}
    </div>
  );
}

HomepageDarkContent.propTypes = {
  content: PropTypes.shape({
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
