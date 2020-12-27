import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import Image from 'next/image';
import { motion, useTransform, MotionValue } from 'framer-motion';

import styles from './Parallax.module.sass';
const cx = classNames.bind(styles);


function ParallaxImage({ img, layout, zoom, scrollProgress, sectionIndex }) {
  if (!Object.keys(layout).length) return <React.Fragment />;

  const { video } = img;

  if (!layout.from) layout.from = layout;
  const { from } = layout;
  const to = { ...from, ...layout.to };

  const y = useTransform(scrollProgress, [0, 1], [from.top || 0, to.top || 0]);
  const scale = useTransform(scrollProgress, [0, 1], [from.zoom || 1, to.zoom || 1]);

  // Add event listener to attach videos with mode 'progress' to scroll position

  // Note on videos with 'progress' mode: videos should be encoded in ffmpeg as h.264 videos with a
  // small value for `keyint`. This increases file size a lot, but ensures that there will be enough
  // key frames in the video to allow very quick seeking to arbitrary positions in the video.
  // Example:  ffmpeg -i input.mp4 -vcodec libx264 -x264opts keyint=1 output.mp4
  const videoEl = useRef(null);
  useEffect(() => {
    if (video && video.mode === 'progress') {
      return scrollProgress.onChange((p) => {
        if (videoEl.current && p >= 0 && p <= 1) {
          const bounds = videoEl.current.getBoundingClientRect();
          const enter = window.innerHeight;
          const exit = 0 - bounds.height;
          let elementProgress = (bounds.top - enter) / (exit - enter);
          elementProgress = Math.min(Math.max(elementProgress, 0), 1);
          const videoTime = elementProgress * videoEl.current.duration || 0;
          videoEl.current.currentTime = videoTime;
        }
      });
    }

    return undefined;
  }, [videoEl, scrollProgress, video?.src, video?.mode]);

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
              <motion.div
                src={img.src}
                alt={img.alt}
                className={cx('image-wrapper')}
                style={{ width, height, scale: zoom ? scale : 1 }}
              >
                <Image
                  src={img.filename || img.src}
                  alt={img.alt}
                  width={imgWidth}
                  height={imgHeight}
                  layout="responsive"
                  className={cx('inner-image')}
                  priority={sectionIndex === 0}
                  sizes={`${Math.ceil(width * Math.min(Math.max(from.zoom, to.zoom, 1), 2))}px`}
                />
              </motion.div>
            )
            : (
              <motion.video
                ref={videoEl}
                src={video.src}
                poster={img.src}
                playsinline
                muted
                preload="auto"

                style={{ width, height, scale: zoom ? scale : 1 }}

                onLoadedData={(e) => {
                  if (video.mode === 'loop') e.target.play();
                }}
                onEnded={(e) => {
                  if (video.mode === 'loop') {
                    e.target.currentTime = 0.1; // skip a couple frames to prevent white flashes
                    e.target.play();
                  }
                }}
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
    filename: PropTypes.string,
    video: PropTypes.shape({
      src: PropTypes.string.isRequired,
      mode: PropTypes.oneOf(['loop', 'progress']),
    }),
  }).isRequired,
  zoom: PropTypes.bool,
  sectionIndex: PropTypes.number,
};
ParallaxImage.defaultProps = {
  scrollProgress: new MotionValue(0),
  layout: {},
  zoom: true,
  sectionIndex: -1,
};

export default ParallaxImage;
