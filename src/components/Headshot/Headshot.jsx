import React from 'react';
import PropTypes from 'prop-types';

import Image from 'next/image';

import classNames from 'classnames/bind';
import styles from './Headshot.module.sass';
const cx = classNames.bind(styles);


export default function Headshot({ image, objectFit }) {
  // Display the "unfiltered" image if it exists and its aspect ratio matches that of the main
  // hero image
  const { dimensions: d, unfiltered_dimensions: d2 } = image;
  const displayUnfilteredImage = !!image.unfiltered_src && d[0] / d[1] === d2[0] / d2[1];

  return (
    <div
      className={cx('base')}
      onTouchStart={() => { document.body.style.webkitUserSelect = 'none'; }}
      onTouchEnd={() => { document.body.style.webkitUserSelect = 'text'; }}
      onTouchCancel={() => { document.body.style.webkitUserSelect = 'text'; }}
    >
      {displayUnfilteredImage && (
        <Image
          src={image.unfiltered_filename || image.unfiltered_src}
          alt={image.unfiltered_alt}
          layout="fill"
          objectFit={objectFit}
          priority
        />
      )}
      <Image
        src={image.filename || image.src}
        alt={image.alt}
        layout="fill"
        objectFit={objectFit}
        priority
        // If we have an "unfiltered" version of the image, this one should fade on hover.
        className={cx({ 'fading-overlay': displayUnfilteredImage })}
      />
    </div>
  );
}

Headshot.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    filename: PropTypes.string,
    alt: PropTypes.string.isRequired,
    dimensions: PropTypes.arrayOf(PropTypes.number).isRequired,
    // Sometimes an "unfiltered" version of the image is also provided
    unfiltered_src: PropTypes.string,
    unfiltered_filename: PropTypes.string,
    unfiltered_alt: PropTypes.string,
    unfiltered_dimensions: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  objectFit: PropTypes.oneOf(['contain', 'cover']),
};
Headshot.defaultProps = {
  objectFit: 'contain',
};
