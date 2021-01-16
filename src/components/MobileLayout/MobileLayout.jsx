import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useStore } from 'store';

import { useRouter } from 'next/router';
import baseSequences from './sequences.js'; // This is provided as a static import by val-loader
import pick from 'lodash/pick';

import { motion } from 'framer-motion';
import MenuIcon from 'components/MenuIcon';

import styles from './MobileLayout.module.sass';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);


// Find a route definition inside a specific sequence that matches the route we’re on. Calculate
// the indices within 'baseSequences' of both the matching sequence and the matching route within
// that sequence.
function getRouteCoordinates(path) {
  const sequenceMatches = baseSequences.map(({ pages }) => (
    pages.filter(({ href, as }) => (path === (as || href)))
  ));
  const currentSequenceIndex = sequenceMatches.findIndex(({ length }) => length > 0);
  const currentSequence = baseSequences[currentSequenceIndex];
  const matchedRoute = sequenceMatches[currentSequenceIndex]?.[0];
  const routeIndexInSequence = currentSequence?.pages?.indexOf?.(matchedRoute) ?? -1;
  // currentSequenceIndex, routeIndexInSequence describe coordinates in baseSequences (or -1)
  return [currentSequenceIndex, routeIndexInSequence];
}

// Given the path to a page and the “page attributes” for that page ({ Component, pageProps, etc. })
// return a copy of oldSequences that has the relevant route updated with the given attrs
function augmentRoute(oldSequences, path, pageAttributes) {
  const [seqIdx, routeIdx] = getRouteCoordinates(path);
  return oldSequences.map(({ id, pages }, i) => ({
    id,
    pages: pages.map((r, j) => ({
      ...r,
      // If the coordinates match the destination coordinates, augment with pageAttributes
      ...(i === seqIdx && j === routeIdx) ? pageAttributes : {},
    })),
  }));
}

/**
 * The MobileLayout provides a horizontal (portrait oriented) swipe-based layout. Swiping
 * horizontally switches between pages of the app. MobileLayout also provides a bottom bar with
 * buttons to perform the swipe actions, and a top bar which can open a menu.
 *
 * MobileLayout caches pages as they are loaded to fill that
 */
function MobileLayout(propsForCurrentPage) {
  const router = useRouter();

  // This references the two attributes of the currently rendered page: the Component and the
  // corresponding pageProps.
  const pageAttributesRef = useRef();
  pageAttributesRef.current = pick(propsForCurrentPage, ['Component', 'pageProps', 'pageName', 'isLight', 'provideH1']);
  // This copy of the baseSequences additionally holds cached pageAttributes for each page.
  // The initial state has only the first page 'augmented' with pageAttributes. Other pages are
  // augmented as they are loaded (see the effect hook below)
  const [routeSequences, setRouteSequences] = useState(
    augmentRoute(baseSequences, router.asPath, pageAttributesRef.current),
  );
  // Capture pageAttributes for each page we load
  useEffect(() => {
    // Cache { Component, pageProps } for the current page
    const cachePageAttributes = (path) => {
      setRouteSequences((ps) => augmentRoute(ps, path, pageAttributesRef.current));
    };
    router.events.on('routeChangeComplete', cachePageAttributes);
    return () => router.events.off('routeChangeComplete', cachePageAttributes);
  }, [setRouteSequences, router.events]);

  const [currentSequenceIndex, currentPageIndex] = getRouteCoordinates(router.asPath);
  const { id: currentSequenceId, pages: seqPages } = routeSequences[currentSequenceIndex];

  /* Manage page rendering and transitions */

  // One ref for each item
  const pageRefs = useRef([]);
  if (seqPages && pageRefs.current.length !== seqPages.length) {
    pageRefs.current = seqPages.map(() => React.createRef());
  }

  useEffect(() => {
    const transitionPage = (url, smooth = true) => {
      const [newSeqIdx, newSeqPageIdx] = getRouteCoordinates(url);
      if (newSeqIdx !== -1 && newSeqPageIdx !== -1) {
        const el = pageRefs.current[newSeqPageIdx]?.current;
        if (el) {
          el.scrollIntoView({
            behavior: smooth ? 'smooth' : 'auto',
            block: 'start',
            inline: 'start',
          });
        }
      }
      window.scrollTo(window.pageXOffset, 0);
    };
    transitionPage(router.asPath, false); // jump every time the currentSequence changes
    const smoothTransition = (url) => transitionPage(url, true);
    router.events.on('routeChangeComplete', smoothTransition);
    return () => router.events.off('routeChangeComplete', smoothTransition);
  }, [currentSequenceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const { state: { menuOpen }, dispatch } = useStore();

  return (
    <motion.div
      className={cx('wrapper')}
      animate={menuOpen ? 'menu-open' : 'menu-closed'}
    >
      {/* Menu bar at the top */}
      <div className={cx('menu-button', 'mobile', { light: propsForCurrentPage.isLight })}>
        <motion.button type="button" onClick={() => dispatch('setMenuOpen', !menuOpen)}>
          <MenuIcon />
          {
            propsForCurrentPage.provideH1
              ? <h1 className={cx('label')}>{ propsForCurrentPage.pageName || 'Menu' }</h1>
              : <div className={cx('label')}>{ propsForCurrentPage.pageName || 'Menu' }</div>
          }
        </motion.button>
      </div>
      {/* Page content */}
      {
        seqPages
          // The page is part of a sequence
          ? seqPages.map(({
            title, // The 'title' is the pre-determined page from sequences.js
            Component, pageProps, // We render loaded pages with these
            isLight = false, // The default 'placeholder' is dark
            href: pageHref, as: pageAs,
          }, i) => (
            <div
              className={cx('mobile-page', { light: isLight })}
              key={`${pageAs}-${pageHref}`}
              ref={pageRefs.current[i]}
            >
              {/* Main page content */}
              {Component
                // We have the component for this page; render the whole page
                ? <Component {...pageProps} />
                // If we don’t have the component for this page, render a placeholder there instead
                : <div className={cx('placeholder')}>{title}</div>}
            </div>
          ))
          // If the page is not part of a sequence, we just render the current page and assume we
          // have all the info.
          : (
            <div
              className={cx('mobile-page', { light: propsForCurrentPage.isLight })}
            >
              <propsForCurrentPage.Component {...propsForCurrentPage.pageProps} />
            </div>
          )
      }
    </motion.div>
  );
}

MobileLayout.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isLight: PropTypes.bool.isRequired,
  pageName: PropTypes.string,
  provideH1: PropTypes.bool,
};
MobileLayout.defaultProps = {
  pageName: null,
  provideH1: false,
};

export default MobileLayout;
