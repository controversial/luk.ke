import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

import Link from 'next/link';

import links from './routes';

import styles from './Menu.sass';


function Menu({ orientation }) {
  const router = useRouter();
  const currentRoute = router.route;

  return (
    <nav className="menu">
      <ul>
        {
          Object.entries(links).map(([label, routes]) => (
            <li
              key={label}
              className={routes.includes(currentRoute) ? 'active' : ''}
            >
              <Link href={routes[0]}>
                <a>{label}</a>
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
