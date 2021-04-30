import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

const CANONICAL_BASE = 'https://luk.ke/';
const IMAGE_BASE_WIDTH = 1200;
const IMAGE_BASE_HEIGHT = 627;

export default function Meta({ title, description, path, canonicalPath }) {
  const fullTitle = `${title} | Luke Deen Taylor`;
  const canonicalUrl = new URL(canonicalPath ?? path, CANONICAL_BASE).href;
  const images = [2, 1, 3].map((sc) => {
    const screenshotBase = new URL(
      '/api/screenshot/',
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : CANONICAL_BASE,
    );
    const imageUrl = new URL(path.startsWith('/') ? path.slice(1) : path, screenshotBase);
    imageUrl.searchParams.append('scale', sc);
    return { url: imageUrl.href, width: IMAGE_BASE_WIDTH * sc, height: IMAGE_BASE_HEIGHT * sc };
  });

  return (
    <Head>
      {/* Title */}
      <title>{fullTitle}</title>
      <meta property="og:title" content={fullTitle} key="og_title" />
      <meta name="twitter:title" content={fullTitle} key="twitter_title" />
      {/* Description */}
      {description && (
        <>
          <meta name="description" content={description} key="description" />
          <meta property="og:description" content={description} key="og_description" />
          <meta property="twitter:description" content={description} key="twitter_description" />
        </>
      )}
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} key="canonical" />
      <meta property="og:url" content={canonicalUrl} key="og_url" />
      {/* Images */}
      {images.map(({ url, width, height }, i) => (
        <React.Fragment key={url}>
          <meta property="og:image" content={url} key={`og_image_${i + 1}`} />
          {/* Note: these end up in the wrong place after a page transition, but probably ok since
                    most crawlers will not perform client side navigation */}
          <meta property="og:image:width" content={width} key={`og_image_width_${url}`} />
          <meta property="og:image:height" content={height} key={`og_image_height_${url}`} />
        </React.Fragment>
      ))}
      <meta name="twitter:image" content={images[2].url} key="twitter_image" />
      <meta name="twitter:image:alt" content={`Screenshot of “${title}” page from Luke Deen Taylor`} key="twitter_image_alt" />
      {}
      {/* Twitter miscellany */}
      <meta name="twitter:card" content="summary_large_image" key="twitter_card_type" />
      <meta name="twitter:creator" content="@lukedeentaylor" key="twitter_creator" />
    </Head>
  );
}

Meta.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  path: PropTypes.string.isRequired,
  // for homepage, when we screenshot /hello but need canonical /
  canonicalPath: PropTypes.string.isRequired,
};
Meta.defaultProps = {
  description: null,
};
