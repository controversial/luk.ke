import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Link from 'next/link';
import ArrowDownIcon from '../../../public/static/icons/down-arrow.svg';

import styles from './ArrowLink.module.sass';
const cx = classNames.bind(styles);


export default function ArrowLink({ children, className, ...props }) {
  return (
    <Link {...props}>
      <a className={classNames(cx('arrow-link'), className)}>
        { children }
        <ArrowDownIcon className={cx('arrow')} />
      </a>
    </Link>
  );
}

ArrowLink.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
ArrowLink.defaultProps = {
  className: '',
};
