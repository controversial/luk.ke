/* eslint-disable import/order */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';

import Link from 'next/link';

import links from './routes';

import styles from './Menu.module.sass';
const cx = classNames.bind(styles);
const cxUnscoped = classNames;


function Menu({ orientation }) {
  const router = useRouter();
  const currentRoute = router.route;

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
            >
              <Link href={routes[0]}>
                <a role="link">
                  <span>{label}</span>
                </a>
              </Link>
            </li>
          ))
        }
      </ul>
    </nav>
  );
}

Menu.propTypes = {
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
};

export default Menu;
