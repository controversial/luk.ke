import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useStore } from 'store';
import useFreezable from 'helpers/react/useFreezable';

import { useRouter } from 'next/router';

import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { useTransformMulti, easings } from 'helpers/react/motion';
import useStyleFix from './prod-transition-style-fix';

import Menu from 'components/Menu';
import MenuIcon from 'components/MenuIcon';

import styles from './PanelsLayout.module.sass';
const cx = classNames.bind(styles);

const { ease } = easings;

function getOrientationClass(orientation) {
  return ({
    left: 'panel-on-left',
    right: 'panel-on-right',
    full: 'panel-full',
  })[orientation];
}


/**
 * This component provides a layout with four full-height sections: a light colored panel with
 * fixed-position content, a dark section behind/to the side of the light panel with scrolling
 * content, and a menu component off screen to each side.
 */

function PanelsLayout({
  lightContent: passedLightContent,
  darkContent: passedDarkContent,
  orientation: passedOrientation,
  pageName: passedPageName,
  provideH1: passedProvideH1,
  willNavigate,
}) {
  useStyleFix();

  // This component supports "freezing" updates to certain cached state values.
  // This is useful for preserving the old state during animations.
  // In this component, freezeUpdates=true implies that we are in the middle of a page transition
  const [freezeUpdates, setFreezeUpdates] = useState(false);
  // Make freezable cached copies of all the data passed in props
  const lightContent = useFreezable(passedLightContent, freezeUpdates);
  const darkContent = useFreezable(passedDarkContent, freezeUpdates);
  const orientation = useFreezable(passedOrientation, freezeUpdates);
  const pageName = useFreezable(passedPageName, freezeUpdates);
  const provideH1 = useFreezable(passedProvideH1, freezeUpdates);

  // Whether or not the menu is open is recorded in the global application store
  const { state: { menuOpen, dimensions }, dispatch } = useStore();

  const variant = menuOpen ? 'menu-open' : 'menu-closed';
  // The offset, in px, to be applied to the PanelsLayout to display the menu
  const openOffset = orientation === 'right' ? -dimensions.menuWidth : dimensions.menuWidth;

  // While opening/closing the menu, this is the amount by which the whole panels container is
  // transformed
  const x = useMotionValue(0);
  const inverseX = useTransform(x, (val) => val * -1);

  // We set will-change on the transformed elements before they are transformed in order to improve
  // performance
  const [willTransform, setWillTransform] = useState(false);
  const [willFade, setWillFade] = useState(false);

  // We need imperative control over the panels container's styles for page transitions
  const panelsControls = useAnimation();
  // The variant for the panels container syncs with the variant from the top-level component
  if (!freezeUpdates) panelsControls.start(variant);
  // We're also going to need imperative control over the light panel
  const lightPanelControls = useAnimation();
  const [lightPanelAnimCallback, setLightPanelAnimCallback] = useState(null);

  // This is the opacity of everything besides the panels themselves (all buttons and text content).
  // It's controlled imperatively with opacityControls, and used during the page transition sequence
  const globalOpacity = useMotionValue(1);
  const opacityControls = useAnimation();
  // This maps the motion of the PanelsLayout to the opacity of the content
  // Causes content to fade out when the menu opens
  const menuOpenProgress = useTransform(x, (val) => Math.abs(val / openOffset));
  const menuFadeOpacity = useTransform(menuOpenProgress, [0, 1], [1, 0.5]);
  const contentOpacity = useTransformMulti([menuFadeOpacity, globalOpacity], (a, b) => a * b);

  // We can set content to display: none while it's hidden to improve performance
  const [displayContent, setDisplayContent] = useState(true);
  const contentStyles = {
    opacity: contentOpacity,
    display: displayContent ? 'block' : 'none',
    pointerEvents: (menuOpen || freezeUpdates) ? 'none' : 'auto',
    willChange: (menuOpen || willNavigate || willFade) ? 'opacity' : 'auto',
  };

  // This ref is used for non-stale access to passedOrientation, since the value of
  // passedOrientation changes over the course of the async onNavigate function.
  const orientationRef = useRef(passedOrientation);
  orientationRef.current = passedOrientation;

  const router = useRouter();
  // This function orchestrates the animation sequence for page transitions!
  async function onNavigate() {
    // A promise that will resolve once route change is successful
    const routeChanged = new Promise((resolve) => {
      const onComplete = () => { resolve(); router.events.off('routeChangeComplete', onComplete); };
      router.events.on('routeChangeComplete', onComplete);
    });
    // Pause at the old state
    setFreezeUpdates(true);
    // Fade out all content
    setWillFade(true);
    await opacityControls.start({ opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } });
    setDisplayContent(false);
    // Wait for the new route to load
    await routeChanged; // TODO: handle errors
    // Check whether the light panel will change position as the result of this transition
    const orientationWillChange = orientationRef.current !== orientation;
    const lightPanelWillMove = orientationWillChange || menuOpen;
    // Without animation, close the menu and transform the light panel to stay in place
    if (menuOpen) lightPanelControls.set({ x: openOffset });
    panelsControls.set('menu-closed');
    // Record that the menu is closed
    dispatch('setMenuOpen', false);
    // Let the new page content/attributes flow in
    setFreezeUpdates(false);
    // Wait for the panel to finish sliding
    if (lightPanelWillMove) {
      await Promise.all([
        // Close the menu
        lightPanelControls.start({ x: 0 }),
        new Promise((resolve) => setLightPanelAnimCallback(() => resolve)),
      ]);
    }
    setLightPanelAnimCallback(null);
    // Fade in all content
    setDisplayContent(true);
    await opacityControls.start({ opacity: 1, transition: { duration: 0.65, ease: 'easeOut' } });
    setWillFade(false);
  }

  // The page transition function should run whenever the route changes.
  // We have to re-bind the function when the primitive values that it depends on change
  useEffect(() => {
    router.events.on('routeChangeStart', onNavigate);
    return () => { router.events.off('routeChangeStart', onNavigate); };
  }, [orientation, menuOpen]); // eslint-disable-line react-hooks/exhaustive-deps


  // On Safari, prevent scroll while the menu is open to fix a bug
  useEffect(() => {
    function preventScrollOnSafari(e) {
      if (window.safari && menuOpen) e.preventDefault();
    }
    window.addEventListener('wheel', preventScrollOnSafari);
    return () => window.removeEventListener('wheel', preventScrollOnSafari);
  }, [menuOpen]);


  return (
    <motion.div
      style={{ display: 'contents' }}
      animate={variant}
      initial={false}
    >
      {/*
        The main panels container. Displays a dark and light panel that fill up the whole viewport,
        as well as a menu to the left and the right. This whole container shifts to the left/right
        to reveal the menu.
      */}
      <motion.div
        className={cx('panels-layout', getOrientationClass(orientation), { 'menu-open': menuOpen })}
        style={{ x, willChange: willTransform ? 'transform' : 'auto' }}
        variants={{
          'menu-open': { x: openOffset },
          'menu-closed': { x: 0 },
        }}
        animate={panelsControls}
        transition={{ type: 'tween', duration: 0.4, ease }}
      >
        {/* There's a menu off screen to the left.
            Note: one motion element needs to link globalOpacity to opacityControls. We're using
            this since it's the first element that uses globalOpacity */}
        <motion.div style={{ opacity: globalOpacity }} animate={opacityControls}>
          <Menu orientation="left" freezeUpdates={freezeUpdates} />
        </motion.div>

        {/* Light panel */}
        <motion.div
          layout={(!freezeUpdates && !displayContent)}
          transition={{ duration: 0.5, ease: [0.5, 0.1, 0.25, 1] }}
          onLayoutAnimationComplete={lightPanelAnimCallback}
          className={cx('panel', 'light')}
          animate={lightPanelControls}
        >
          <div className={cx('nav-cover')} />
          <motion.div className={cx('content')} style={contentStyles}>
            { React.cloneElement(lightContent, { freezeUpdates }) }
          </motion.div>
        </motion.div>

        {/* Dark content sits "behind" and to the side of right panel */}
        { orientation === 'full' ? null
          : (
            <motion.div
              className={cx('panel', 'dark')}
            >
              <motion.div className={cx('content')} style={contentStyles}>
                { React.cloneElement(darkContent, { freezeUpdates }) }
              </motion.div>
            </motion.div>
          ) }

        {/* When the menu opens there's a big transparent div over the page that intercepts click
            events to close the menu */}
        <div
          className={cx('menu-close-target')}
          style={{ display: (menuOpen && !freezeUpdates) ? 'block' : 'none' }}
          onClick={() => dispatch('setMenuOpen', false)}
          role="none"
        />

        {/* There's a menu off screen to the right */}
        <motion.div style={{ opacity: globalOpacity }}>
          <Menu orientation="right" freezeUpdates={freezeUpdates} />
        </motion.div>
      </motion.div>


      {/* Menu button that floats above */}
      {/*
        There are two copies of the menu button rendered.
        - The "light" copy of the menu button has an opaque white background. This background
          obscures the dark copy, and clips the light button as the menu slides open.
        - The "dark" copy of the menu button is revealed from under the light copy when the menu
          opens.
      */}

      <motion.div
        style={{
          opacity: globalOpacity,
          pointerEvents: freezeUpdates ? 'none' : 'auto',
          position: 'relative',
          zIndex: 3,
        }}
        onMouseEnter={() => { setWillTransform(true); setWillFade(true); }}
        onMouseLeave={() => { setWillTransform(false); setWillFade(false); }}
      >
        {/* light menu button */}
        <motion.div
          className={cx('menu-button', 'light', getOrientationClass(orientation))}
          // This div has the light background. It slides over with the PanelsLayout when menu opens
          style={{ x }}
        >
          <motion.button
            type="button"
            // The visible text of the button slides in the opposite direction so that it stays in
            // place. However, the parent div has overflow: hidden and clips this div as it moves.
            style={{ x: inverseX }}
            onClick={() => { dispatch('setMenuOpen', true); }}
          >
            <MenuIcon />
            {
              // For SEO, it’s important to have exactly one h1 element on every page. Some pages
              // might tell us that they don't provide a h1 element in their markup. Fortunately,
              // we already have an element on each page that renders the page title - the menu
              // button! In cases where the h1 would otherwise be missing, we can just turn the menu
              // button label into a h1.
              provideH1
                ? <h1 className={cx('label')}>{ pageName || 'Menu' }</h1>
                : <div className={cx('label')}>{ pageName || 'Menu' }</div>
            }
          </motion.button>
        </motion.div>
        {/* dark menu button */}
        <div
          className={cx('menu-button', 'dark', getOrientationClass(orientation))}
        >
          <button
            type="button"
            onClick={() => { dispatch('setMenuOpen', false); }}
          >
            <MenuIcon />
            <div className={cx('label')}>Close</div>
          </button>
        </div>
      </motion.div>

    </motion.div>
  );
}

PanelsLayout.propTypes = {
  lightContent: PropTypes.element.isRequired,
  darkContent: PropTypes.element,
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
  pageName: PropTypes.string,
  provideH1: PropTypes.bool,
  willNavigate: PropTypes.bool,
};
PanelsLayout.defaultProps = {
  darkContent: null,
  pageName: null,
  provideH1: false,
  willNavigate: false,
};

export default PanelsLayout;
