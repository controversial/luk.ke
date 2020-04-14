// All position and size values are given in width percentages
// All position values are relative to the ParallaxSection, which scrolls
// Size is a percentage of section width and defines a square into which the image will be fit
// ParallaxImages appear with their 'from' values when their ParallaxSection enters the bottom
// of the viewport. They reach their 'to' values as it disappears past the top of the page

export default {
  'layout-1': [
    {
      from: { top: 75, zoom: 1.4, right: 0, size: [48, 52], zIndex: 2 },
      to: { top: 10, zoom: 1 },
    },
    {
      from: { top: 6, zoom: 1, left: 0, size: [40, 45], zIndex: 1 },
      to: { top: 36, zoom: 1.2 },
    },
    {
      from: { top: 90, zoom: 1, left: 18, size: [29, 32], zIndex: 3 },
    },
  ],
};
