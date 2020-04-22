/* eslint-disable import/prefer-default-export */

// Gets a placeholder version of an image that fits in an 100x100 square and will be displayed
// before lazy loading
export function getLazyPlaceholder(img, size = 100) {
  const url = new URL(img);
  url.searchParams.append('w', size);
  url.searchParams.append('h', size);
  url.searchParams.append('fit', 'fit');
  return url.href;
}
