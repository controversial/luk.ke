import React from 'react';
import PropTypes from 'prop-types';

import { motion } from 'framer-motion';

function MenuIcon({ menuOpen }) {
  // const transition = {
  //   type: 'tween',
  //   duration: 0.35,
  //   ease: 'backIn',
  // };
  const transition = {
    type: 'spring',
    mass: 0.25,
    stiffness: 150,
    damping: 10,
    velocity: 0,
  };

  return (
    <div className="icon">
      <motion.div
        className="line"
        variants={{
          'menu-closed': {
            width: '100%',
            rotate: 0,
            y: '-.5em',
          },
          'menu-open': {
            width: '90%',
            rotate: 45,
            y: 0,
          },
        }}
        transition={transition}
      />
      <motion.div
        className="line"
        variants={{
          'menu-closed': {
            width: '100%',
            rotate: 0,
            y: '.5em',
          },
          'menu-open': {
            width: '90%',
            rotate: -45,
            y: 0,
          },
        }}
        transition={transition}
      />
    </div>
  );
}

MenuIcon.propTypes = {
  menuOpen: PropTypes.bool.isRequired,
};

export default MenuIcon;
