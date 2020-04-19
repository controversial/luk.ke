import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './TagsList.module.sass';
const cx = classNames.bind(styles);


export default function TagsList({ children, max }) {
  return (
    <ul className={`tags-list ${cx('tags-list')}`}>
      {
        React.Children.map(children, (child, idx) => (idx < max && (
          <li>{ child }</li>
        )))
      }
    </ul>
  );
}

TagsList.propTypes = {
  children: PropTypes.node.isRequired,
  max: PropTypes.number,
};
TagsList.defaultProps = {
  max: Infinity,
};
