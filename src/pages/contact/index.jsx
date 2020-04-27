import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

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

function ContactPageDarkContent() {
  return (
    <div>Dark</div>
  );
}

Object.assign(Contact, {
  LightContent: ContactPageLightContent,
  DarkContent: ContactPageDarkContent,
  pageName: 'Contact',
  panelOrientation: 'right',
});


export default Contact;
