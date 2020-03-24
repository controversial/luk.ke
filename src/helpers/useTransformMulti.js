import { useEffect } from 'react';
import { useMotionValue } from 'framer-motion';

// Adapted from https://github.com/framer/motion/blob/99862c082144ceb0451516bdb7777c28b0b3f02f/src/value/use-relative.ts
export default function useTransformMulti(parentMotionValues, transformFunc) {
  function computeValue() {
    const parentValues = parentMotionValues.map((mv) => mv.get());
    const computedValue = transformFunc(...parentValues);
    return computedValue;
  }

  // Create new motion value and initialize it with initial transformed value
  const transformedValue = useMotionValue(computeValue());

  // - Sets up event listeners for the transformedValue to update when the parentMotionValues update
  // - Updates value and re-establishes event listeners whenever different MotionValues or a
  //   different transform function is passed
  useEffect(() => {
    function updateValue() { transformedValue.set(computeValue()); }
    updateValue();
    const removeFuncs = parentMotionValues.map((mv) => mv.onChange(updateValue));
    // The cleanup function returned from useEffect calls each onChange remover in sequence
    return () => removeFuncs.forEach((removeFunc) => removeFunc());
  }, [parentMotionValues, transformFunc]);

  return transformedValue;
}
