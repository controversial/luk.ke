/* eslint-disable import/order */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';
import { useStore } from '../../store';

import Link from 'next/link';

import links from './routes';

import styles from './Menu.module.sass';
const cx = classNames.bind(styles);
const cxUnscoped = classNames;


function Menu({ orientation }) {
  const router = useRouter();
  const currentRoute = router.route;

  const { state: { menuOpen }, dispatch } = useStore();

  const alignment = orientation === 'right' ? 'right' : 'left'; // full -> left

  function toggleMenu() { dispatch('setMenuOpen', !menuOpen); }

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
                {/* eslint-disable jsx-a11y/interactive-supports-focus */}
                {/* eslint-disable jsx-a11y/click-events-have-key-events */}
                <a role="link" onClick={toggleMenu}>
                  <span>{label}</span>
                </a>
                {/* eslint-enable */}
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
