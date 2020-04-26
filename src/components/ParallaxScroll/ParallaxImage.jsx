import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { motion, useTransform, MotionValue } from 'framer-motion';

import { getResizedImage } from '../../helpers/image';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


function ParallaxImage({ img, layout, zoom, scrollProgress }) {
  if (!Object.keys(layout).length) return <React.Fragment />;

  const { video } = img;

  if (!layout.from) layout.from = layout;
  const { from } = layout;
  const to = { ...from, ...layout.to };

  const y = useTransform(scrollProgress, [0, 1], [from.top || 0, to.top || 0]);
  const scale = useTransform(scrollProgress, [0, 1], [from.zoom || 1, to.zoom || 1]);

  // fit image into size box specified in layout.size

  const fitWidth = from.size?.[0] || from.size;
  const fitHeight = from.size?.[1] || from.size;
  const { dimensions: [imgWidth, imgHeight] } = img;

  let width; let height;
  // if the image aspect ratio is wider than the container box, fit by width
  if ((imgWidth / imgHeight) > (fitWidth / fitHeight)) {
    width = fitWidth;
    height = width * (imgHeight / imgWidth);
  // If the image aspect ratio is taller than the container box, fit by height
  } else {
    height = fitHeight;
    width = height * (imgWidth / imgHeight);
  }


  // Compute the optimal size to request an image given the size of the frame it needs to display in
  const getImageSizeForFrameSize = (frameSize) => frameSize
    // Get the largest size at which the image will ever be displayed
    .map((dim) => dim * (Math.max(from.zoom, to.zoom, 1) || 1)) // scale by max image could scale
    .map((dim) => dim * (window.devicePixelRatio || 1)) //         scale by device pixel ratio
    .map(((dim) => Math.ceil(dim))) //                             use whole-pixel values
    // Make sure we're never upscaling and requesting an unnecessarily large image
    .map((dim, i) => Math.min(dim, [imgWidth, imgHeight][i]));

  // Get an array of image srcs, each paired with its corresponding optimal frame width
  const srcset = useMemo(() => {
    const commonViewportWidths = [768, 1024, 1280, 1440, 1600, 1920, 2560];

    // since 'width' is based on the current viewport size, we know the ratio between window width
    // and frame width and can use it to calculate frame sizes corresponding to other viewport sizes
    const commonFrameSizes = commonViewportWidths.map((w) => {
      const ratio = (w / window.innerWidth);
      return [Math.round(width * ratio), Math.round(height * ratio)];
    });
    return commonFrameSizes.map(([w, h], i) => {
      const isLargestSize = i === commonFrameSizes.length - 1;
      const imageSize = isLargestSize
        ? getImageSizeForFrameSize([Infinity, Infinity])
        : getImageSizeForFrameSize([w, h]);
      const imageSrc = getResizedImage(img.src, imageSize);
      return [imageSrc, w];
    });
  }, []);

  // We want to use the smallest defined image size that's designed for a display size bigger than
  // what the current display size is
  let imageSizeToUse = (
    srcset.find(([, imageWidth]) => imageWidth > width)
      || srcset[srcset.length - 1] // fallback to largest defined size
  )[1];
  // Browsers will multiply "sizes" value by DPR automatically, but we've already accounted for DPR,
  // so we need to anticipate and reverse this behavior
  imageSizeToUse = Math.floor(imageSizeToUse / (window.devicePixelRatio || 1));


  return (
    <motion.div
      className={cx('parallax-image')}
      style={{
        y,
        left: from.left,
        right: from.left ? undefined : from.right, // don't apply right if we applied left
        width: from.size?.[0] || from.size,
        height: from.size?.[1] || from.size,
        zIndex: from.zIndex,
        // if we're up against the left or right edge, make sure the fitted image is still against
        // that side
        ...from.left === 0 && { justifyContent: 'flex-start' },
        ...from.right === 0 && { justifyContent: 'flex-end' },
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { opacity: { duration: 0.3, ease: 'easeInOut' } } }}
    >
      <div style={{ width, height }}>
        {
          !video
            ? (
              <motion.img
                src={img.lazyPlaceholder || img.src}
                data-src={img.src}
                data-srcset={srcset.map(([src, w]) => `${src} ${w}w`).join(',')}
                sizes={`${imageSizeToUse}px`}
                className="lazyload"
                alt={img.alt}
                style={{ width, height, scale: zoom ? scale : 1 }}
              />
            )
            : (
              <motion.video
                src={video}
                poster={img.src}
                playsinline
                muted
                onLoadedData={(e) => e.target.play()}
                onEnded={(e) => {
                  e.target.currentTime = 0.1; // skip a couple frames to prevent white flashes
                  e.target.play();
                }}
                style={{ width, height, scale: zoom ? scale : 1 }}
              />
            )
        }
      </div>
    </motion.div>
  );
}

const layoutParams = {
  left: PropTypes.number,
  right: PropTypes.number,
  top: PropTypes.number,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
  zoom: PropTypes.number,
  zIndex: PropTypes.number,
};

ParallaxImage.propTypes = {
  scrollProgress: PropTypes.instanceOf(MotionValue),
  layout: PropTypes.shape({
    from: PropTypes.shape(layoutParams),
    to: PropTypes.shape(layoutParams),
  }),
  img: PropTypes.shape({
    alt: PropTypes.string,
    dimensions: PropTypes.arrayOf(PropTypes.number).isRequired,
    src: PropTypes.string.isRequired,
    video: PropTypes.string,
    lazyPlaceholder: PropTypes.string,
  }).isRequired,
  zoom: PropTypes.bool,
};
ParallaxImage.defaultProps = {
  scrollProgress: new MotionValue(0),
  layout: {},
  zoom: true,
};

export default ParallaxImage;
