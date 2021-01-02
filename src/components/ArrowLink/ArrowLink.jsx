import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Link from 'next/link';
import ArrowDownIcon from '../../../public/static/icons/down-arrow.svg';

import styles from './ArrowLink.module.sass';
const cx = classNames.bind(styles);


export default function ArrowLink({ children, left, className: passedClassName, ...props }) {
  const { href } = props;
  const isAbsoluteUrl = (() => {
    try { return !!new URL(href); } catch (e) { return false; }
  })();

  const className = classNames(cx('arrow-link', { left }), passedClassName);
  // Absolute (external) URLs can't be wrapped in a Link
  if (isAbsoluteUrl) {
    return (
      <a className={className} {...props}>
        { children }
        <ArrowDownIcon className={cx('arrow')} />
      </a>
    );
  }

  // Internal URLs need to be wrapped in a Link
  if (href) {
    return (
      <Link {...props}>
        <a className={className}>
          { children }
          <ArrowDownIcon className={cx('arrow')} />
        </a>
      </Link>
    );
  }

  // If there's no href at all, just use a button
  return (
    <button type="button" className={className} {...props}>
      { children }
      <ArrowDownIcon className={cx('arrow')} />
    </button>
  );
}

ArrowLink.propTypes = {
  children: PropTypes.node.isRequired,
  left: PropTypes.bool,
  className: PropTypes.string,
  href: PropTypes.string,
};
ArrowLink.defaultProps = {
  left: false,
  className: '',
  href: undefined,
};
