import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getContactPage } from '../api/content/contact';

import Head from 'next/head';

import styles from './index.module.sass';
const cx = classNames.bind(styles);


function Contact() {
  return (
    <React.Fragment>
      <Head>
        <title>Luke Deen Taylor</title>
      </Head>
    </React.Fragment>
  );
}


function ContactPageLightContent() {
  return (
    <div>Light</div>
  );
}


function ContactPageDarkContent({ content }) {
  return (
    <div>{ content.title }</div>
  );
}
ContactPageDarkContent.propTypes = {
  content: PropTypes.exact({
    title: PropTypes.string.isRequired,
    links: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })).isRequired,
  }).isRequired,
};


Object.assign(Contact, {
  LightContent: ContactPageLightContent,
  DarkContent: ContactPageDarkContent,
  pageName: 'Contact',
  panelOrientation: 'right',

  async getInitialProps(ctx) {
    return { content: await getContactPage(ctx.req) };
  },
});


export default Contact;
