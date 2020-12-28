import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class CustomDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="preload" as="font" type="font/woff2" href="/static/fonts/Manrope-Variable-Subset.woff2" crossOrigin="anonymous" />
          <link rel="preload" as="font" type="font/woff2" href="/static/fonts/Inter-Variable-Subset.woff2" crossOrigin="anonymous" />
        </Head>

        <body>
          <Main />

          {/* Simple analytics tracker */}
          {/* The sa.luk.ke domain is supposed to look innocuous to fool adblockers */}
          <script data-skip-dnt="true" async defer src="https://sa.luk.ke/latest.js" />

          <NextScript />
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
