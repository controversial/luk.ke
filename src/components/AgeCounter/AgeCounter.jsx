import React, { useEffect, useState } from 'react';

import getAge from '../../helpers/age';

export default function AgeCounter() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <span>{ getAge(time).toFixed(7) }</span>
  );
}
