/* eslint-disable import/prefer-default-export */

// Gets a placeholder version of an image that fits in an 100x100 square and will be displayed
// before lazy loading
export function getResizedImage(img, size = 100) {
  const sizeBox = (Array.isArray(size) && size) || [size, size];
  const url = new URL(img);
  url.searchParams.append('w', sizeBox[0]);
  url.searchParams.append('h', sizeBox[1]);
  url.searchParams.append('fit', 'fit');
  return url.href;
}
