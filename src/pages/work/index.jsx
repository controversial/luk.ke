import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { getProjects } from '../api/content/work';
import parse from 'html-react-parser';

import { useRouter } from 'next/router';
import Head from 'next/head';
import { InView } from 'react-intersection-observer';

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
function getIndexFromHash(projects) {
  if (typeof window === 'undefined') return 0; // can't see hash server side
  const currentUid = window.location.hash && window.location.hash.substr(1);
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

function LightContent({ content: projects, bus }) {
  // Start out displaying whichever project the URL hash dictates.
  const [currProjectIndex, setCurrProject] = useState(getIndexFromHash(projects));
  const project = projects[currProjectIndex];
  // We change what project we display when we receive an event that says to do so.
  // These events are emitted from DarkContent
  useEffect(() => {
    bus.on('changeProject', setCurrProject);
    return () => bus.off('changeProject', setCurrProject);
  }, []);

  return (
    <div className={cx('project-overview')}>
      { parse(project.head) }
    </div>
  );
}
LightContent.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape({
    uid: PropTypes.string.isRequired,
    head: PropTypes.string.isRequired,
    featured_images: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,

  bus: PropTypes.shape({
    on: PropTypes.func,
    off: PropTypes.func,
  }).isRequired,
};


// The dark section contains a parallax scrolling list of images
function DarkContent({ content: projects, bus }) {
  const [currProjectIndex, setCurrProject] = useState(getIndexFromHash(projects));

  // DarkContent controls the "current project" for both the dark and light content.
  function updateProject(index) {
    if (index !== currProjectIndex) {
      bus.emit('changeProject', index);
      setCurrProject(index);
    }
  }

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
    }, [currProjectIndex]);
  }

  // When we scroll to the section that corresponds to a certain project we should change projects
  function switchFromScroll(uid) {
    const newIndex = projects.map((p) => p.uid).indexOf(uid);
    updateProject(newIndex !== -1 ? newIndex : 0);
    // Change the URL hash silently, without triggering a scroll jump
    const uri = `${window.location.href}#`;
    const newUri = uri.replace(/#.*$/, `#${uid}`);
    window.history.replaceState(null, '', newUri);
  }

  return (
    <div className={cx('images-container')}>
      { projects.map((p) => (
        <InView
          as="section"
          id={p.uid}
          key={p.uid}
          // The area we're observing the intersection on is the area between 50% from the top and
          // 49% from the bottom.
          rootMargin="-50% 0px -49%"
          // Whichever project section enters this area from either side becomes the active project.
          // Caveat: if a section just barely enters this area and then the user scrolls back the
          // other way, the site won't go back to the previously active section
          onChange={(inView) => { if (inView) switchFromScroll(p.uid); }}
        >
          { parse(p.head) }
        </InView>
      )) }
    </div>
  );
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
