import { useEffect, useState } from 'react';

// Get a state variable whose value we can 'freeze updates' to by passing freeze=true
// The returned value is a copy of the passed value, but its value will only update if freeze=false
export default function useCache(value, freeze) {
  const [cachedValue, setCachedValue] = useState(value);
  useEffect(() => {
    if (!freeze) setCachedValue(value);
  }, [value, freeze]); // Run the update function anytime the value or the freeze state changes
  return cachedValue;
}
