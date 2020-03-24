import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';


export default function FadeOnChange({ watch, children, style }) {
  return (
    <AnimatePresence exitBeforeEnter initial={false}>
      <motion.div
        key={watch} // When key changes, react will unmount/remount this component
        style={{ opacity: 0, willChange: 'opacity', ...style }}
        animate={{ opacity: 1, transition: { delay: 0.25 } }}
        exit={{ opacity: 0 }}
        transition={{ type: 'tween', duration: 0.5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
FadeOnChange.propTypes = {
  watch: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
FadeOnChange.defaultProps = {
  style: {},
};
