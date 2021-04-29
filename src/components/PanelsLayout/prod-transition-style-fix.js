// See https://github.com/vercel/next.js/issues/17464
// In production, styles are removed prematurely in route transition.
// This is a workaround for that bug, based on https://github.com/vercel/next.js/issues/17464#issuecomment-796430107

import { useEffect } from 'react';

const isNextStyleTag = (el) => el.nodeName.toLowerCase() === 'style' && el.getAttribute('media') === 'x';
const isNextLinkTag = (el) => el.nodeName.toLowerCase() === 'link' && el.getAttribute('rel') === 'stylesheet';

// Hide Next's link tags and style tags from Next
const hideElements = (els) => [...els]
  .filter((el) => (isNextStyleTag(el) || isNextLinkTag(el)))
  .forEach((el) => ['media', 'data-n-p'].forEach((attr) => el.removeAttribute(attr)));

export default function useStyleFix() {
  useEffect(() => {
    hideElements(document.head.childNodes);
    const observer = new MutationObserver((muts) => hideElements(muts.map((mut) => mut.target)));
    observer.observe(document.head, { subtree: true, attributes: true, childList: true });
    return () => observer.disconnect();
  }, []);
}
