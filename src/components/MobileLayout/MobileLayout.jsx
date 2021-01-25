import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useStore } from 'store';

import { useRouter } from 'next/router';
import baseSequences from './sequences.js'; // This is provided as a static import by val-loader
import pick from 'lodash/pick';

import { motion } from 'framer-motion';
import { animate } from 'popmotion';

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
  const routeSequencesRef = useRef(null);
  routeSequencesRef.current = routeSequences;
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
  const { id: currentSequenceId, pages: seqPages } = routeSequences[currentSequenceIndex] ?? {};
  const currentPage = routeSequences[currentSequenceIndex]?.pages?.[currentPageIndex];
  const [closestPage, setClosestPage] = useState(currentPage);

  /* Manage page rendering and transitions */

  const horizontalScrollContainer = useRef(null);
  // One ref for each item
  const pageRefs = useRef([]);
  if (seqPages && pageRefs.current.length !== seqPages.length) {
    pageRefs.current = seqPages.map(() => React.createRef());
  }

  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  useEffect(() => {
    const transitionPage = (url, smooth = true) => {
      const [newSeqIdx, newSeqPageIdx] = getRouteCoordinates(url);
      if (newSeqIdx !== -1 && newSeqPageIdx !== -1) {
        const el = pageRefs.current[newSeqPageIdx]?.current;
        const hsc = horizontalScrollContainer.current;
        if (el) {
          // Quickly snap to top
          const currentX = hsc.scrollLeft;
          hsc.scrollTo(currentX, 0);
          // Animate scroll right
          const targetX = el.offsetLeft;
          if (smooth) {
            setIsAutoScrolling(true);
            setClosestPage(routeSequences[newSeqIdx]?.pages?.[newSeqPageIdx]);
            animate({
              ...{ from: currentX, to: targetX },
              ...{ type: 'spring', mass: 1, stiffness: 600, damping: 90 },
              onUpdate: (value) => hsc.scrollTo(value, 0),
              onComplete: () => setTimeout(() => setIsAutoScrolling(false), 50),
            });
          } else {
            hsc.scrollTo(targetX, 0);
          }
        }
      }
    };
    transitionPage(router.asPath, false); // jump every time the currentSequence changes
    const smoothTransition = (url) => transitionPage(url, true);
    router.events.on('routeChangeComplete', smoothTransition);
    return () => router.events.off('routeChangeComplete', smoothTransition);
  }, [currentSequenceId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Record which page the user is scrolled nearest
  useEffect(() => {
    // Disable scroll listener while scrolling automatically
    if (isAutoScrolling) return () => {};
    const el = horizontalScrollContainer.current;
    const offsetsLeft = pageRefs.current.map((pel) => pel.current.offsetLeft);
    // Update direction on every scroll event
    const scrollListener = () => {
      const distances = offsetsLeft.map((ol) => Math.abs(el.scrollLeft - ol));
      const closestPageIndex = distances.indexOf(Math.min(...distances));
      setClosestPage(routeSequencesRef.current[currentSequenceIndex].pages[closestPageIndex]);
    };

    el.addEventListener('scroll', scrollListener);
    return () => el.removeEventListener('scroll', scrollListener);
  }, [currentSequenceIndex, isAutoScrolling]);

  // TODO: navigate to the closestPage when it changes, but ensure programmatic navigation animation
  // doesn’t kick in
  const isAutoScrollingRef = useRef();
  isAutoScrollingRef.current = isAutoScrolling;
  useEffect(() => {
    if (!isAutoScrollingRef.current) {
      console.log('USER CHANGED SCROLL TO: ', closestPage);
    }
  }, [closestPage?.as || closestPage?.href]); // eslint-disable-line react-hooks/exhaustive-deps

  const { state: { menuOpen }, dispatch } = useStore();

  return (
    <React.Fragment>
      {/* Menu bar at the top */}
      <div className={cx('menu-button', 'mobile', { light: propsForCurrentPage.isLight })}>
        <motion.button
          type="button"
          onClick={() => dispatch('setMenuOpen', !menuOpen)}
          animate={menuOpen ? 'menu-open' : 'menu-closed'}
        >
          <MenuIcon />
          {
            propsForCurrentPage.provideH1
              ? <h1 className={cx('label')}>{ propsForCurrentPage.pageName || 'Menu' }</h1>
              : <div className={cx('label')}>{ propsForCurrentPage.pageName || 'Menu' }</div>
          }
        </motion.button>
      </div>

      <div
        className={cx('wrapper')}
        style={{ scrollSnapType: isAutoScrolling ? 'none' : 'x mandatory' }}
        key={currentSequenceId}
        ref={horizontalScrollContainer}
      >
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
                  // If we don’t have the component for this page, render a placeholder instead
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
      </div>
    </React.Fragment>
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
