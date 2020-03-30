/* eslint-disable import/order */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';
import useCache from '../../helpers/useCache';

import Link from 'next/link';
import links from './routes';

import HeartIcon from '../../../public/static/icons/heart.svg';


import styles from './Menu.module.sass';
const cx = classNames.bind(styles);
const cxUnscoped = classNames;


function Menu({ orientation, freezeUpdates }) {
  const router = useRouter();
  const currentRoute = useCache(router.route, freezeUpdates);

  const alignment = orientation === 'right' ? 'right' : 'left'; // full -> left

  return (
    // Include 'menu' both as a scoped class name and as an unscoped class name
    <nav role="navigation" className={cxUnscoped('menu', cx('menu', alignment))}>
      <ul>
        {
          Object.entries(links).map(([label, routes]) => (
            <li
              key={label}
              className={cx({ active: routes.includes(currentRoute) })}
              style={{ pointerEvents: freezeUpdates ? 'none' : 'auto' }}
            >
              <Link href={routes[0]}>
                {/* eslint-disable jsx-a11y/interactive-supports-focus */}
                {/* eslint-disable jsx-a11y/click-events-have-key-events */}
                <a role="link">
                  <span>{label}</span>
                </a>
                {/* eslint-enable */}
              </Link>
            </li>
          ))
        }
      </ul>

      <a
        className={cx('signature')}
        href="https://github.com/controversial/luk.ke"
        target="_blank"
        rel="noopener noreferrer"
      >
        Made with
        <HeartIcon />
        by Luke
      </a>
    </nav>
  );
}

Menu.propTypes = {
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
  freezeUpdates: PropTypes.bool,
};
Menu.defaultProps = {
  freezeUpdates: false,
};


export default Menu;
