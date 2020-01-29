import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import getAge from '../../helpers/age';

export default function AgeCounter({ places }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, (places > 7) ? 16 : 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="age">{ getAge(time).toFixed(places) }</span>
  );
}

AgeCounter.propTypes = { places: PropTypes.number };
AgeCounter.defaultProps = { places: 8 };
