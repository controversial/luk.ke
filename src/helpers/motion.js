import { useEffect, useRef, useMemo } from 'react';
import { useMotionValue, MotionValue } from 'framer-motion';
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


// A motion value whose value is the
export function useVelocity(parent) {
  const velocity = useMotionValue(parent.getVelocity() || 0);

  useEffect(() => {
    function update() { velocity.set(parent.getVelocity() || 0); }
    update();
    const removeListener = parent.onChange(update);
    return () => removeListener();
  }, [parent]);

  return velocity;
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

// Based on the useSpring implementation included in framer-motion
// From a MotionValue, creates a MotionValue smoothed out with linear interpolation
export function useLerp(source, config = {}) {
  const activeLerpAnimation = useRef(null);
  // This is the MotionValue on which our updates will be based
  // source can be either a number or a motionvalue
  const lerpedValue = useMotionValue(source instanceof MotionValue ? source.get() : source);

  useMemo(() => {
    // "attach" attaches a "passive effect" to the MotionValue, which intercepts calls to "set"
    // If 'value' has a "passive effect" attached, calls to 'set' will call that attached effect
    // function, instead of directly updating the value.
    // Only one function is attached at a time, so there's no need to unattach before useMemo runs
    lerpedValue.attach((value, setFunc) => { // this is the "effect function"
      // If there's a lerp animation running, stop it so that it won't continue to send conflicting
      // updates
      if (activeLerpAnimation.current) activeLerpAnimation.current.stop();
      // Attach a new lerp animation
      activeLerpAnimation.current = lerper({
        from: lerpedValue.get(),
        to: value,
        ...config,
      }).start(setFunc); // the animation should call the setFunc with the new value as it goes
    });
  // we only need to redefine what the effect function is when the config changes
  }, Object.values(config));

  // If the source value is a MotionValue, we need to trigger our internal motionValue to update
  // whenever the source value updates.
  useEffect(() => {
    let unbindFunc;
    if (source instanceof MotionValue) {
      unbindFunc = source.onChange((v) => lerpedValue.set(parseFloat(v)));
    }
    return unbindFunc;
  }, [source]);

  return lerpedValue;
}
