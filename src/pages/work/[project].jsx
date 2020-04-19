import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import Error from 'next/error';

// component imports here

import { getProject } from '../api/content/work/[project]';
import parse, { domToReact } from 'html-react-parser';

import styles from './project.module.sass';
const cx = classNames.bind(styles);


function CaseStudy({ project, errorCode }) {
  /* eslint-disable react/prop-types */
  function addClassName({ name: tag, attribs, children, parent }, className) {
    if (!attribs || parent) return undefined; // only apply to the root node
    const existingClassName = attribs.class;
    delete attribs.class;
    return React.createElement(tag, {
      ...attribs, className: cx(...(existingClassName || ''), className).trim(),
    }, domToReact(children));
  }
  /* eslint-enable */
  const asTextBlock = { replace: (node) => addClassName(node, ['block', 'text-block']) };


  if (errorCode) return <Error statusCode={errorCode} />;

  return (
    <div className={cx('page')}>
      { parse(project.head, asTextBlock) }
      { parse(project.subhead, asTextBlock) }
    </div>
  );
}

CaseStudy.propTypes = {
  project: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    head: PropTypes.string.isRequired,
    subhead: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    content: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(['section_heading', 'content', 'image', 'image_gallery', 'video', 'video_gallery', 'embed']),
    })).isRequired,
  }),
  errorCode: PropTypes.number,
};
CaseStudy.defaultProps = {
  project: null,
  errorCode: null,
};


Object.assign(CaseStudy, {
  pageName: 'Work',

  async getInitialProps(ctx) {
    try {
      return { project: await getProject(ctx.req, ctx.query.project) };
    } catch (e) {
      const statusCode = e.message.startsWith("Couldn't find") ? 404 : 500;
      return { errorCode: statusCode };
    }
  },
});

export default CaseStudy;
