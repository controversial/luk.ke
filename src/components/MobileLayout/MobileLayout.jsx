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
  content: passedContent,
  currPageName: passedCurrPageName,
  // nextPage: passedNextPage,
  // prevPage: passedPrevPage,
  provideH1: passedProvideH1,
}) {
  const { state: { menuOpen }, dispatch } = useStore();
  const variant = menuOpen ? 'menu-open' : 'menu-closed';

  // Eventually, these have to be stored in state in order to keep old values during transitions
  const content = passedContent;
  const currPageName = passedCurrPageName;
  // const nextPage = passedNextPage;
  // const prevPage = passedPrevPage;
  const provideH1 = passedProvideH1;

  return (
    <motion.div
      className={cx('mobile-layout')}
      animate={variant}
    >
      <div className={cx('menu-button', 'mobile')}>
        <motion.button type="button" onClick={() => dispatch('setMenuOpen', !menuOpen)}>
          <MenuIcon />
          {
            provideH1
              ? <h1 className={cx('label')}>{ currPageName || 'Menu' }</h1>
              : <div className={cx('label')}>{ currPageName || 'Menu' }</div>
          }
        </motion.button>
      </div>

      {content}
    </motion.div>
  );
}

MobileLayout.propTypes = {
  content: PropTypes.element.isRequired,
  currPageName: PropTypes.string,
  // nextPage: PropTypes.exact({
  //   name: PropTypes.string.isRequired,
  //   path: PropTypes.string.isRequired,
  // }).isRequired,
  // prevPage: PropTypes.exact({
  //   name: PropTypes.string.isRequired,
  //   path: PropTypes.string.isRequired,
  // }).isRequired,
  provideH1: PropTypes.bool,
};
MobileLayout.defaultProps = {
  currPageName: null,
  provideH1: false,
};

export default MobileLayout;
