/* The Responsive system provides a SSR-friendly approach to conditionally rendering content by
 * media queries.
 *
 * The ideal solution to conditional responsive rendering is to completely avoid rendering the DOM
 * nodes for components that are not displayed. However, during SSR this is impossible, because we
 * cannot match media queries server-side.
 *
 * Therefore, we have two approaches:
 *   - conditional_rendering: only render the react component tree for visible children.
 *   - css_display: render component tree for all content, and additionally render a
 *                  global stylesheet to apply 'display: none' to hidden children.
 *
 * We apply the css_display approach on the first render, then we switch to the
 * conditional_rendering approach once the app has mounted client-side.
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Head from 'next/head';


// Configure the available media queries
const queries = {
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
};


// The stylesheet to power the initial css-based approach
const css = Object.entries(queries).map(([name, query]) => `
  ${/* Everything is hidden automatically */ ''}
  .Responsive_${name} { display: none; }

  ${/* Un-hide elements whose queries match */ ''}
  @media ${query} {
    .Responsive_${name} { display: contents; }
  }
`);


/* MediaQuery accepts and validates a 'query' prop. The parent Responsive component conditionally
 * renders each child MediaQuery based on its query. */
export function MediaQuery({ children, query: queryName, approach }) {
  if (approach === 'undefined') throw new Error('MediaQuery must have a Responsive as its parent.');

  return (
    <div
      {...{
        // under the 'css_display' mode, the element needs a classname
        css_display: { className: `Responsive_${queryName}` },
        // under the 'conditional_rendering' mode, the element needs to disappear
        conditional_rendering: { style: { display: 'contents' } },
      }[approach]}
    >
      {children}
    </div>
  );
}
MediaQuery.propTypes = {
  children: PropTypes.node,
  query: PropTypes.oneOf(Object.keys(queries)).isRequired,
  approach: PropTypes.oneOf(['css_display', 'conditional_rendering']),
};
MediaQuery.defaultProps = {
  children: null,
  approach: undefined,
};


/**
 * The Responsive component is a required wrapper for MediaQuery children.
 */
export function Responsive({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const approach = mounted ? 'conditional_rendering' : 'css_display';

  const [matchedQueries, setMatchedQueries] = useState([]);
  useEffect(() => {
    const update = () => {
      setMatchedQueries(
        Object.entries(queries)
          .filter(([, query]) => window.matchMedia(query).matches)
          .map(([name]) => name),
      );
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <>
      {/* A stylesheet powers the css_display approach */}
      <Head>
        {approach === 'css_display' && (
          <style className="responsive-ssr-styles">{css}</style>
        )}
      </Head>

      {React.Children.map(children, (child) => {
        // We need to modify MediaQuery components in two ways:
        //   1. When the current approach is conditional_rendering, we don't render children
        //      whose media queries don't match.
        //   2. Regardless of what the current approach is, we let the child know which approach
        //      to follow.
        if (React.isValidElement(child) && child?.type?.name === MediaQuery.name) {
          if (approach === 'conditional_rendering' && !matchedQueries.includes(child.props.query)) {
            return null;
          }
          return React.cloneElement(child, { approach });
        }
        // Transparently render everything else
        return child;
      })}
    </>
  );
}
Responsive.propTypes = {
  children: PropTypes.node.isRequired,
};
