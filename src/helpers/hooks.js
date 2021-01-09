/* eslint-disable import/prefer-default-export */
import { useState, useEffect } from 'react';

export function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return windowWidth;
}

export function useElementWidth(elementRef) {
  // Track the dimensions of the ParallaxScroll
  const [width, setWidth] = useState(0);
  // Update dimensions on mount and whenever the size changes
  useEffect(() => {
    if (elementRef.current !== null) {
      const el = elementRef.current;
      const { width: currWidth } = el.getBoundingClientRect();
      setWidth(currWidth);
      const ro = new ResizeObserver(([{ contentRect }]) => {
        setWidth(contentRect.width);
      });
      ro.observe(el);
      return () => ro.unobserve(el);
    }
    return () => {};
  }, [elementRef]);

  return width;
}
