import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from 'store';

import { motion } from 'framer-motion';
import MenuIcon from 'components/MenuIcon';

import styles from './MobileLayout.module.sass';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

/**
 * The MobileLayout provides a horizontal (portrait oriented) swipe-based layout. Swiping
 * horizontally switches between pages of the app, but some pages can also provide multiple
 * sections which are swiped through in turn.
 * MobileLayout also provides a bottom bar with buttons to perform the swipe actions, and a top bar
 * which can open a menu.
 */
function MobileLayout({
  Component,
  pageProps,
  isLight,
  currPageName,
  provideH1,
}) {
  const { state: { menuOpen }, dispatch } = useStore();
  const variant = menuOpen ? 'menu-open' : 'menu-closed';


  return (
    <motion.div
      className={cx('mobile-layout', { light: isLight })}
      animate={variant}
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
