import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

// component imports here

import { getProject } from '../api/content/work/[project]';
import parse, { domToReact } from 'html-react-parser';

import styles from './[project].module.sass';
const cx = classNames.bind(styles);


function CaseStudy({ project }) {
  /* eslint-disable react/prop-types */
  function addClassName({ name: tag, attribs, children, parent }, className) {
    if (!attribs || parent) return undefined; // only apply to the root node
    const existingClassName = attribs.class;
    delete attribs.class;
    return React.createElement(tag, {
      ...attribs, className: `${existingClassName || ''} ${className}`.trim(),
    }, domToReact(children));
  }
  /* eslint-enable */
  return (
    <div className={cx('page')}>
      { parse(content.head) }
    </div>
  );
}

CaseStudy.propTypes = {
  content: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    head: PropTypes.string.isRequired,
    subhead: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    featured_images: PropTypes.arrayOf(PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
      dimensions: PropTypes.arrayOf(PropTypes.number),
      show_overlay: PropTypes.bool,
    })).isRequired,
  }).isRequired,
};


Object.assign(CaseStudy, {
  pageName: 'Work',

  async getInitialProps(ctx) {
    return { content: await getProject(ctx.req, ctx.query.project) };
  },
});

export default CaseStudy;
