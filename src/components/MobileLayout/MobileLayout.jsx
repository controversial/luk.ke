import React from 'react';
import PropTypes from 'prop-types';

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
  nextPage: passedNextPage,
  prevPage: passedPrevPage,
  provideH1: passedProvideH1,
}) {
  return (
    <div
      className={cx('mobile-layout')}
    >
      Mobile layout
    </div>
  );
}

MobileLayout.propTypes = {
  content: PropTypes.element.isRequired,
  currPageName: PropTypes.string,
  nextPage: PropTypes.exact({
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
  }).isRequired,
  prevPage: PropTypes.exact({
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
  }).isRequired,
  provideH1: PropTypes.bool,
};
MobileLayout.defaultProps = {
  currPageName: null,
  provideH1: false,
};

export default MobileLayout;
