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
