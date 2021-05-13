import React from 'react';
import classNames from 'classnames/bind';

import { motion } from 'framer-motion';
import { easings } from 'helpers/react/motion';

import styles from './MenuIcon.module.sass';
const cx = classNames.bind(styles);


function MenuIcon() {
  const transition = {
    type: 'tween',
    duration: 0.15,
    delay: 0.15,
    ease: easings.ease,
  };

  return (
    <div className={cx('icon')}>
      <motion.div
        className={cx('line')}
        variants={{
          'menu-closed': {
            width: '100%',
            rotate: 0,
            y: '-.45em',
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
