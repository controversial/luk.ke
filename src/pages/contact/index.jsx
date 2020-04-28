import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { getContactPage } from '../api/content/contact';

import ArrowLink from '../../components/ArrowLink';
import Head from 'next/head';

import styles from './index.module.sass';
const cx = classNames.bind(styles);


function useInputState(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  return [value, (e) => setValue(e.target.value)];
}


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
  const [name, onNameChange] = useInputState();
  const [email, onEmailChange] = useInputState();
  const [message, onMessageChange] = useInputState();

  function submit() {
    console.log('submitting');
    console.log('name: ', name);
    console.log('email: ', email);
    console.log('message: ', message);
  }


  return (
    <div className={cx('contact-page', 'light-content')}>
      <h1>
        Send&nbsp;a
        <br />
        message
      </h1>

      <form
        action="/api/contact"
        className={cx('contact-form')}
        onSubmit={(e) => { e.preventDefault(); submit(); }}
      >
        <input type="text" name="name" placeholder="Your name" value={name} onChange={onNameChange} />
        <input type="text" name="email" placeholder="Your email" value={email} onChange={onEmailChange} />
        <textarea rows="5" name="message" placeholder="What’s up?" cols="0" value={message} onChange={onMessageChange} />

        <ArrowLink type="submit">
          Send your message
        </ArrowLink>
      </form>
    </div>
  );
}


function ContactPageDarkContent({ content: { title, links } }) {
  return (
    <div className={cx('contact-page', 'dark-content')}>
      <h1>{ title }</h1>
      <ul>
        { links.map(({ label, url }) => (
          <li key={url}>
            <ArrowLink href={url} target="_blank" rel="noopener noreferrer">{label}</ArrowLink>
          </li>
        ))}
      </ul>
    </div>
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
