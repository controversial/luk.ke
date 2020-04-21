// Safari doesn't respect the overscroll-behavior property, which creates visual unpleasantness as
// well as unpredictable behavior for components like OverscrollTrigger. This function uses
// javascript to emulate "overscroll-behavior: none" on Safari.

import { isScrolledToBottom } from './components/OverscrollTrigger/OverscrollTrigger.jsx';
function isScrolledToTop() { return document.body.scrollTop <= 1; }

let safariOverscrollListenerAdded = false;

function preventOverscroll(e) {
  const preventTop = isScrolledToBottom() && e.deltaY > 0; // scrolling down past bottom of page
  const preventBottom = isScrolledToTop() && e.deltaY < 0; // scrolling up past top of page

  if (preventTop || preventBottom) e.preventDefault();
}

export default function setSafariScrollFix() {
  if (
    typeof window !== 'undefined' && typeof document !== 'undefined'
    && window.safari && !safariOverscrollListenerAdded
  ) {
    document.body.addEventListener('wheel', preventOverscroll);
    safariOverscrollListenerAdded = false;
  }
}
