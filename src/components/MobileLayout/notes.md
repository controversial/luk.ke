# Notes on mobile layout

## Overview

The “current sequence” is an array of objects:
  ```js
  {
    title: required,
    href: required,
    as: optional,
  }
  ```
All pages in the “current sequence“ are laid out in a horizontally scrolling series with scroll
snap. The user can horizontally swipe between pages, and when the user has swiped between pages, we
know what page they're on. We follow the following procedure:
  - Initially, only the page that Next.js is currently providing us has content.
  - Build an array `loadedPages` that looks like `[null, FirstLoadedPageComponent, null, null]`
  - For the `null` entries, we render the page title in big bold text in the center of the page.
  - When the user swipes to a new page, call `router.push` to navigate.
  - Once `routeChangeComplete` fires, check `router.pathname` to find the href that was loaded, and
    slot the `Component` that Next.js passes us into the right slot in the `pages` array.
  - When we swap the rendered page from the `null` placeholder with the page title to the real
    component, animate a fade

For non-null entries, this process means we initially render the version of the page that we fetched
before, and if Next.js gives us a different Component later we will replace it (but I don't think
this will ever be the case in practice).

## Alternate sequences
Some parts of the site are not part of the main sequence, but part of a separate sequence entirely
(for example, the case study pages). To address this, keep multiple page sequences instead of just a
single sequence, and have a separate `loadedPages` array for each sequence.

If a page isn't part of any sequence, the bottom nav becomes hidden.

## Non-swipe transitions
Following links in the menu is trivial since the menu covers the whole screen. We don’t have to
present a fancy animation; just wait to close the menu until the new page is loaded.

Following links on pages is more complicated. Use the following steps:
  - If the page is part of a different sequence (or not part of any sequence), fade out/in
  - If the page is part of the same sequence, make it seem like it's only one swipe away:
    - Transform page to the slot right next to the page we're transitioning to
    - then animate scroll over.

## Wide pages
Some pages provide more than one page’s width of content. These pages can be laid out with however
much space they need. I will implement either as multiple snapping pages or as one wider
continuously scrolling section. TODO: look into whether it’s possible to do the latter with
scroll-snap proximity

## Vertically scrolling pages
When swiping between vertically scrolling pages, it will be hard to make sure the scrolling happens
right. In order to make sure the body scrolls vertically, we will make the horizontal scroll
container be the  As an initial plan, maybe:
  - once horizontal scrolling is initiated, transform the destination page down so its top is at the
    current scroll position of the origin page. Then, once the page “lands,” remove the transform
    and scroll body back up to the top.
