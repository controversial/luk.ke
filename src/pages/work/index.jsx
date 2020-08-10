import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { useRouter } from 'next/router';
import Head from 'next/head';

import { AnimatePresence, motion } from 'framer-motion';
import { useBodyScroll } from 'helpers/motion';
import { ParallaxScroll, ParallaxSection, ParallaxImage } from 'components/ParallaxScroll';
import ArrowLink from 'components/ArrowLink';
import TagsList from 'components/TagsList';

import { getProjects } from 'pages/api/content/work';
import { getResizedImage } from 'helpers/image';
import parse, { domToReact } from 'html-react-parser';

import styles from './index.module.sass';
const cx = classNames.bind(styles);


/**
 * This page serves as a listing for all of the case studies on the site.
 * It displays each project with a brief description and images
 */


/**
 * Helper function that returns the index of the project that we should display at the outset.
 * This is 0 unless changed by the URL hash
 */
function getIndexFromHash(projects, hash) {
  if (!hash && typeof window === 'undefined') return 0; // can't see hash server side
  const currentUid = hash || (window.location.hash && window.location.hash.substr(1));
  const uids = projects.map((p) => p.uid);
  const index = uids.indexOf(currentUid);
  return index === -1 ? 0 : index; // default to the first one if not found
}


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


// The light section displays information about the current case study

const translateMagnitude = 120;
const lightContentTransitionVariants = {
  enter: (direction) => ({ opacity: 0, y: direction ? translateMagnitude : -translateMagnitude }),
  center: {
    y: 0,
    opacity: 1,
    // this is the transition for the entering element
    transition: {
      duration: 0.35, delay: 0.2, y: { ease: 'circOut' }, opacity: { ease: 'easeOut' },
    },
  },
  exit: (direction) => ({
    y: direction ? -translateMagnitude : translateMagnitude,
    opacity: 0,
    // this is the transition for the exiting element
    transition: {
      duration: 0.35, y: { ease: 'circIn' }, opacity: { duration: 0.25, ease: 'easeIn' },
    },
  }),
};

function WorkPageLightContent({ content: projects, bus }) {
  // Start out displaying whichever project the URL hash dictates.
  const [currProjectIndex, setCurrProject] = useState(getIndexFromHash(projects));
  const [scrollDirection, setScrollDirection] = useState(1);
  const project = projects[currProjectIndex];
  // We change what project we display when we receive an event that says to do so.
  // These events are emitted from DarkContent
  useEffect(() => {
    const onChangeProject = (index) => {
      setScrollDirection(index > currProjectIndex ? 1 : 0);
      setCurrProject(index);
    };
    bus.on('changeProject', onChangeProject);
    return () => bus.off('changeProject', onChangeProject);
  }, [currProjectIndex]);

  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);
  const scroll = useBodyScroll();
  useEffect(() => scroll.onChange(() => {
    clearTimeout(scrollTimeout.current);
    setIsScrolling(true);
    scrollTimeout.current = setTimeout(() => setIsScrolling(false), 500);
  }), [isScrolling]);

  // Replace function for html-react-parser that turns tags into h2 elements
  const replaceWithH2 = ({ type, attribs, children }) => {
    if (type === 'tag') return React.createElement('h2', attribs, domToReact(children));
    return undefined;
  };

  return (
    <div className={cx('project-info-wrapper')}>
      <AnimatePresence initial={false} custom={scrollDirection}>
        <motion.article
          className={cx('project-overview')}
          key={project.uid}

          initial="enter"
          animate="center"
          exit="exit"
          variants={lightContentTransitionVariants}
          custom={scrollDirection}

          style={{ willChange: isScrolling ? 'opacity, transform' : 'auto' }}
        >
          <TagsList max={3}>{ project.tags }</TagsList>

          { parse(project.head, { replace: replaceWithH2 }) }
          { parse(project.description) }

          <ArrowLink
            className={cx('read-more')}
            href="/work/[project]"
            as={`/work/${project.uid}`}
          >
            Read more
          </ArrowLink>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
WorkPageLightContent.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape({
    uid: PropTypes.string.isRequired,
    head: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    featured_images: PropTypes.arrayOf(PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
      dimensions: PropTypes.arrayOf(PropTypes.number),
      show_overlay: PropTypes.bool,
    })).isRequired,
  })).isRequired,

  bus: PropTypes.shape({
    on: PropTypes.func,
    off: PropTypes.func,
  }).isRequired,

  freezeUpdates: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
};
WorkPageLightContent.defaultProps = { freezeUpdates: false };


// The dark section contains a parallax scrolling list of images
function WorkPageDarkContent({ content: projects, bus, freezeUpdates }) {
  // DarkContent controls the "current project" for both the dark and light content.
  function updateProject(index) { bus.emit('changeProject', index); }

  // When the hash changes we should change the displayed project.
  const router = useRouter();
  if (typeof window !== 'undefined') { // this isn't relevant server-side
    useEffect(() => {
      const updateFromHash = () => updateProject(getIndexFromHash(projects));
      // bind event listeners
      router.events.on('hashChangeComplete', updateFromHash);
      window.addEventListener('hashchange', updateFromHash);
      // return cleanup function
      return () => {
        router.events.off('hashChangeComplete', updateFromHash);
        window.removeEventListener('hashchange', updateFromHash);
      };
    });
  }

  return (
    <ParallaxScroll
      className={cx('parallax-container')}
      freeze={freezeUpdates}
      onFocusChange={updateProject}
    >

      { projects.map((p) => (
        <ParallaxSection key={p.uid} layout={p.featured_images_layout}>
          { p.featured_images.map((img) => (
            <ParallaxImage
              key={img.src}
              img={{ ...img, lazyPlaceholder: getResizedImage(img.src, 100) }}
              zoom={img.zoom}
            />
          ))}
        </ParallaxSection>
      ))}

    </ParallaxScroll>
  );
}
WorkPageDarkContent.propTypes = WorkPageLightContent.propTypes;
WorkPageDarkContent.defaultProps = WorkPageLightContent.defaultProps;


Object.assign(WorkIndex, {
  LightContent: WorkPageLightContent,
  DarkContent: WorkPageDarkContent,
  pageName: 'Work',
  panelOrientation: 'left',
  missingH1: true,
});


export async function getStaticProps() {
  return {
    props: { content: await getProjects() },
    revalidate: 60,
  };
}

export default WorkIndex;
