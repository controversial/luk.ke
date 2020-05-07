import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './FramedFigure.module.sass';
const cx = classNames.bind(styles);


export default function FramedFigure({ children, caption, focused, frameStyle, className, style }) {
  const child = React.Children.only(children);

  return (
    <figure className={classNames(cx('framed-figure', { focused }), className)} style={style}>
      <div className={cx('frame', frameStyle)}>
        {/* Elements styled to look like "browser chrome" around the contents */}
        <div className={cx('chrome')} aria-hidden>
          <div className={cx('stoplight')} />
          <div className={cx('stoplight')} />
          <div className={cx('stoplight')} />
        </div>

        { React.cloneElement(child, { className: classNames(child.props.className, cx('main')) }) }
      </div>

      { caption && <figcaption>{ caption }</figcaption> }
    </figure>
  );
}

FramedFigure.propTypes = {
  children: PropTypes.node.isRequired,
  caption: PropTypes.node,
  focused: PropTypes.bool,
  frameStyle: PropTypes.oneOf(['light', 'dark', 'none']),
  className: PropTypes.string,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
FramedFigure.defaultProps = {
  caption: null,
  focused: false,
  frameStyle: 'dark',
  className: undefined,
  style: {},
};
