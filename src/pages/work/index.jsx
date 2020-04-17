import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { useRouter } from 'next/router';
import Head from 'next/head';

import { ParallaxScroll, ParallaxSection, ParallaxImage } from '../../components/ParallaxScroll';
import ArrowLink from '../../components/ArrowLink';

import { getProjects } from '../api/content/work';
import parse from 'html-react-parser';

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
    <article className={cx('project-overview')}>
      <ul className={cx('tags-list')}>
        { project.tags.map((t) => <li>{t}</li>)}
      </ul>

      { parse(project.head) }
      { parse(project.description) }

      <ArrowLink
        className={cx('read-more')}
        href="/work/[project]"
        as={`/work/${project.uid}`}
      >
        Read more
      </ArrowLink>
    </article>
  );
}
LightContent.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape({
    uid: PropTypes.string.isRequired,
    head: PropTypes.string.isRequired,
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
};


// The dark section contains a parallax scrolling list of images
function DarkContent({ content: projects, bus }) {
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
    <ParallaxScroll className={cx('parallax-container')} onFocusChange={updateProject}>

      { projects.map((p) => (
        <ParallaxSection key={p.uid} layout={p.featured_images_layout}>
          { p.featured_images.map((img) => (
            <ParallaxImage
              key={img.src}
              img={img}
              zoom={img.zoom}
            />
          ))}
        </ParallaxSection>
      ))}

    </ParallaxScroll>
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
