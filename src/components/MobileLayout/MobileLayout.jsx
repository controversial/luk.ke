import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useStore } from 'store';

import { useRouter } from 'next/router';
import baseRouteSequences from './sequences.js'; // This is provided as a static import by val-loader

import { motion } from 'framer-motion';
import MenuIcon from 'components/MenuIcon';

import styles from './MobileLayout.module.sass';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);


// Find a route definition inside a specific sequence that matches the route we’re on. Calculate
// the indices within routeSequences of both the matching sequence and the matching route within
// that sequence.
function getRouteCoordinates(path) {
  const sequenceMatches = baseRouteSequences.map((seq) => (
    seq.filter(({ href, as }) => (path === (as || href)))
  ));
  const currentSequenceIndex = sequenceMatches.findIndex(({ length }) => length > 0);
  const currentSequence = baseRouteSequences[currentSequenceIndex];
  const matchedRoute = sequenceMatches[currentSequenceIndex]?.[0];
  const routeIndexInSequence = currentSequence?.indexOf?.(matchedRoute) ?? -1;
  // currentSequenceIndex, routeIndexInSequence describe coordinates in routeSequences (or -1)
  return [currentSequenceIndex, routeIndexInSequence];
}

// Given the path to a page and the “page attributes” for that page ({ Component, pageProps, etc. })
// return a copy of oldRouteSequences that has the relevant route updated with the given attrs
function augmentRoute(oldRouteSequences, path, pageAttributes) {
  const [seqIdx, routeIdx] = getRouteCoordinates(path);
  return oldRouteSequences.map((rs, i) => rs.map((r, j) => ({
    ...r,
    // If the coordinates match the destination coordinates, augment with pageAttributes
    ...(i === seqIdx && j === routeIdx) ? pageAttributes : {},
  })));
}

/**
 * The MobileLayout provides a horizontal (portrait oriented) swipe-based layout. Swiping
 * horizontally switches between pages of the app. MobileLayout also provides a bottom bar with
 * buttons to perform the swipe actions, and a top bar which can open a menu.
 *
 * MobileLayout caches pages as they are loaded to fill that
 */
function MobileLayout({
  Component,
  pageProps,
  isLight,
  currPageName,
  provideH1,
}) {
  const router = useRouter();

  // This references the two attributes of the currently rendered page: the Component and the
  // corresponding pageProps.
  const pageAttributesRef = useRef();
  pageAttributesRef.current = { Component, pageProps };
  // This copy of the routeSequences additionally holds cached pageAttributes for each page.
  // The initial state has only the first page 'augmented' with pageAttributes. Other pages are
  // augmented as they are loaded (see the effect hook below)
  const [routeSequences, setRouteSequences] = useState(
    augmentRoute(baseRouteSequences, router.asPath, pageAttributesRef.current),
  );
  if (typeof window !== 'undefined') window.routeSequences = routeSequences;
  // Capture pageAttributes for each page we load
  useEffect(() => {
    // Cache { Component, pageProps } for the current page
    const cachePageAttributes = (path) => {
      const [seqIdx, routeIdx] = getRouteCoordinates(path);
      if (seqIdx > -1 && routeIdx > -1) {
        console.log(`Saving component ${pageAttributesRef.current.Component.name} for route ${path} (${seqIdx}, ${routeIdx})`);
        setRouteSequences((ps) => augmentRoute(ps, path, pageAttributesRef.current));
      }
    };
    router.events.on('routeChangeComplete', cachePageAttributes);
    return () => router.events.off('routeChangeComplete', cachePageAttributes);
  }, [setRouteSequences, router.events]);

  const { state: { menuOpen }, dispatch } = useStore();

  return (
    <motion.div
      className={cx('mobile-layout', { light: isLight })}
      animate={menuOpen ? 'menu-open' : 'menu-closed'}
    >
      <div className={cx('menu-button', 'mobile', { light: isLight })}>
        <motion.button type="button" onClick={() => dispatch('setMenuOpen', !menuOpen)}>
          <MenuIcon />
          {
            provideH1
              ? <h1 className={cx('label')}>{ currPageName || 'Menu' }</h1>
              : <div className={cx('label')}>{ currPageName || 'Menu' }</div>
          }
        </motion.button>
      </div>

      <Component {...pageProps} />
    </motion.div>
  );
}

MobileLayout.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isLight: PropTypes.bool.isRequired,
  currPageName: PropTypes.string,
  provideH1: PropTypes.bool,
};
MobileLayout.defaultProps = {
  currPageName: null,
  provideH1: false,
};

export default MobileLayout;
