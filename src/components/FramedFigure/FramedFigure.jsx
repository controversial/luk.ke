import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './FramedFigure.module.sass';
const cx = classNames.bind(styles);


export default function FramedFigure({ children, href, caption, frameStyle, className, style }) {
  const child = React.Children.only(children);
  const FrameEl = href ? 'a' : 'div';

  return (
    <figure className={classNames(cx('framed-figure'), className)} style={style}>
      {/* The graphic element inside the figure */}
      <FrameEl
        className={cx('frame', frameStyle)}
        {...href && ({ href, target: '_blank', rel: 'noopener' })}
      >
        {/* Elements styled to look like "browser chrome" around the contents */}
        <div className={cx('chrome')} aria-hidden>
          <div className={cx('stoplight')} />
          <div className={cx('stoplight')} />
          <div className={cx('stoplight')} />
        </div>

        { React.cloneElement(child, { className: classNames(child.props.className, cx('main')) }) }
      </FrameEl>

      {/* Optional caption */}
      { caption && <figcaption>{ caption }</figcaption> }
    </figure>
  );
}

FramedFigure.propTypes = {
  children: PropTypes.node.isRequired,
  caption: PropTypes.node,
  href: PropTypes.string,
  frameStyle: PropTypes.oneOf(['light', 'dark', 'none']),
  className: PropTypes.string,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
FramedFigure.defaultProps = {
  caption: null,
  href: null,
  frameStyle: 'dark',
  className: undefined,
  style: {},
};
