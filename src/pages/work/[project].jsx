import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

// component imports here

import { getProject } from '../api/content/work/[project]';
import parse from 'html-react-parser';

import styles from './[project].module.sass';
const cx = classNames.bind(styles);


function CaseStudy({ content }) {
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
