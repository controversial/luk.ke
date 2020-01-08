/* eslint-disable import/order */
import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useStore } from '../../store';

import Link from 'next/link';

import links from './routes';

import styles from './Menu.sass';


function Menu({ orientation }) {
  const router = useRouter();
  const currentRoute = router.route;

  const { state: { menuOpen }, dispatch } = useStore();

  const alignment = orientation === 'right' ? 'right' : 'left';

  function toggleMenu() { dispatch('setMenuOpen', !menuOpen); }

  return (
    <nav className={`menu ${alignment}`}>
      <ul>
        {
          Object.entries(links).map(([label, routes]) => (
            <li
              key={label}
              className={routes.includes(currentRoute) ? 'active' : ''}
            >
              <Link href={routes[0]}>
                {/* eslint-disable jsx-a11y/interactive-supports-focus */}
                {/* eslint-disable jsx-a11y/click-events-have-key-events */}
                <a role="link" onClick={toggleMenu}>
                  {label}
                </a>
                {/* eslint-enable */}
              </Link>
            </li>
          ))
        }
      </ul>
      <style jsx>{styles}</style>
    </nav>
  );
}

Menu.propTypes = {
  orientation: PropTypes.oneOf(['left', 'right', 'full']).isRequired,
};

export default Menu;
