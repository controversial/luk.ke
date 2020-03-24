import React from 'react';
import classNames from 'classnames/bind';

import { motion } from 'framer-motion';

import styles from './MenuIcon.module.sass';
const cx = classNames.bind(styles);


function MenuIcon() {
  const transition = {
    type: 'tween',
    duration: 0.35,
    ease: 'backIn',
  };
  // const transition = {
  //   type: 'spring',
  //   mass: 0.25,
  //   stiffness: 150,
  //   damping: 10,
  //   velocity: 0,
  // };

  return (
    <div className={cx('icon')}>
      <motion.div
        className={cx('line')}
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
        className={cx('line')}
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

export default MenuIcon;