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
        animate={{
          width: menuOpen ? '90%' : '100%',
          rotate: menuOpen ? 45 : 0,
          y: menuOpen ? 0 : '-.5em',
        }}
        initial={false}
        transition={transition}
      />
      <motion.div
        className="line"
        animate={{
          width: menuOpen ? '90%' : '100%',
          rotate: menuOpen ? -45 : 0,
          y: menuOpen ? 0 : '.5em',
        }}
        initial={false}
        transition={transition}
      />
    </div>
  );
}

MenuIcon.propTypes = {
  menuOpen: PropTypes.bool.isRequired,
};

export default MenuIcon;
