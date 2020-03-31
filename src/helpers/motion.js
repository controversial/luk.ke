import sync, { cancelSync } from 'framesync';


export const easings = {
  ease: [0.25, 0.1, 0.25, 1],
};


export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


// Adapted from https://github.com/framer/motion/blob/99862c082144ceb0451516bdb7777c28b0b3f02f/src/value/use-relative.ts
export function useTransformMulti(parentMotionValues, transformFunc) {
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


// LERP FUNCTIONALITY


export const lerp = (from, to, alpha) => (from + ((to - from) * alpha));
export function lerper({ from, to, alpha = 0.1, restDelta = 0.1 }) {
  // In order to mimic the popmption spring API, we return an objcet that has a start() function
  // This start function can be called with an onUpdate callback function
  return {
    start(onUpdate) {
      let position = from;

      // Schedule updates to happen once per frame
      const process = sync.update(({ delta: timeDelta }) => {
        const framesElapsed = timeDelta / (1000 / 60); // number of 60fps frames since last update
        // Perform lerp based on how many frames have passed
        const effectiveAlpha = 1 - ((1 - alpha) ** framesElapsed);
        position = lerp(position, to, effectiveAlpha);
        // if we're within restDelta of the final position, go to the final position & stop updates
        if (Math.abs(to - position) <= restDelta) {
          position = to;
          cancelSync.update(process);
        }
        onUpdate(position);
      }, true);

      // Return an object that has a stop() function
      return {
        stop() { cancelSync.update(process); },
      };
    },
  };
}
