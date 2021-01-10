// See https://github.com/vercel/next.js/issues/17464
// In production, styles are removed prematurely in route transition.
// This is a workaround for that bug, based on https://github.com/vercel/next.js/issues/17464#issuecomment-751267740

import Router from 'next/router';
import { delay } from 'helpers/motion';

Router.events.on('beforeHistoryChange', () => {
  // Add a copy of each style node to the head
  const styleNodes = [
    ...document.querySelectorAll('link[rel=stylesheet]'),
    ...document.querySelectorAll('style:not([media=x])'),
  ];
  const copies = styleNodes.map((e) => e.cloneNode(true));
  copies.forEach((node) => {
    node.removeAttribute('data-n-p');
    node.removeAttribute('data-n-href');
    document.head.appendChild(node);
  });
  // Remove the copies a little while after routeChangeComplete
  const delayedCleanup = async () => {
    Router.events.off('routeChangeComplete', delayedCleanup);
    await delay(500);
    copies.forEach((node) => document.head.removeChild(node));
  };
  Router.events.on('routeChangeComplete', delayedCleanup);
});
