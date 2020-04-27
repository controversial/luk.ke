import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Link from 'next/link';
import ArrowDownIcon from '../../../public/static/icons/down-arrow.svg';

import styles from './ArrowLink.module.sass';
const cx = classNames.bind(styles);


export default function ArrowLink({ children, className, ...props }) {
  const { href } = props;
  const isAbsoluteUrl = (() => {
    try { return !!new URL(href); } catch (e) { return false; }
  })();

  // Absolute (external) URLs can't be wrapped in a Link
  if (isAbsoluteUrl) {
    return (
      <a className={classNames(cx('arrow-link'), className)} {...props}>
        { children }
        <ArrowDownIcon className={cx('arrow')} />
      </a>
    );
  }

  // Internal URLs need to be wrapped in a Link
  if (href) {
    return (
      <Link {...props}>
        <a className={classNames(cx('arrow-link'), className)}>
          { children }
          <ArrowDownIcon className={cx('arrow')} />
        </a>
      </Link>
    );
  }

  // If there's no href at all, just use a button
  return (
    <button type="button" className={classNames(cx('arrow-link'), className)} {...props}>
      { children }
      <ArrowDownIcon className={cx('arrow')} />
    </button>
  );
}

ArrowLink.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  href: PropTypes.string,
};
ArrowLink.defaultProps = {
  className: '',
  href: undefined,
};
