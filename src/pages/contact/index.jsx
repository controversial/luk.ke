import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { getContactPage } from 'pages/api/content/contact';
import parse from 'html-react-parser';

import { useForm } from 'react-hook-form';
import { emailRegex } from 'helpers/email';

import { motion, AnimatePresence } from 'framer-motion';
import { easings } from 'helpers/motion';
import ArrowLink from 'components/ArrowLink';
import Head from 'next/head';

import styles from './index.module.sass';
const cx = classNames.bind(styles);


function Contact() {
  return (
    <React.Fragment>
      <Head>
        <title>Contact | Luke Deen Taylor</title>
      </Head>
    </React.Fragment>
  );
}


function ContactPageLightContent({
  content: { contact_form_success_message: contactFormSuccessMessage },
}) {
  const form = useRef(null);

  const [formState, setFormState] = useState('initial'); // 'initial', 'loading', or 'complete'
  const { handleSubmit, register, formState: { errors } } = useForm();

  async function submit(values) {
    setFormState('loading');
    const response = await fetch(form.current.action, {
      method: 'POST',
      body: new URLSearchParams(values),
    });
    setFormState(response.ok ? 'complete' : 'initial');
  }


  return (
    <div className={cx('overflow-wrapper')}>
      <AnimatePresence initial={false}>
        {
          formState !== 'complete'
            // before submission is complete, show the form
            ? (
              <motion.div
                className={cx('contact-page', 'light-content')}
                key="form"
                initial={{ x: '-50%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-50%', opacity: 0 }}
                transition={{ duration: 0.3, ease: easings.ease, opacity: { duration: 0.2 } }}
                style={{ willChange: ['loading', 'complete'].includes(formState) ? 'transform' : 'auto' }}
              >
                {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                <h2>Send&nbsp;a<br />message</h2>
                <form
                  ref={form}
                  className={cx('contact-form')}
                  noValidate
                  action="/api/contact"
                  onSubmit={handleSubmit(submit)}
                >
                  <fieldset disabled={['loading', 'complete'].includes(formState)}>
                    <input
                      type="text"
                      placeholder="Your name"
                      className={cx('field', { error: errors.name })}
                      {...register('name', { required: true })}
                    />
                    <input
                      type="text"
                      placeholder="Your email"
                      className={cx('field', { error: errors.email })}
                      {...register('email', { required: true, pattern: emailRegex })}
                    />
                    <textarea
                      placeholder="What’s up?"
                      rows="5"
                      className={cx('field', { error: errors.message })}
                      {...register('message', { required: true })}
                    />

                    <ArrowLink type="submit">
                      Send your message
                    </ArrowLink>
                  </fieldset>
                </form>
              </motion.div>
            )

            // After submission is complete, show a thank you message
            : (
              <motion.div
                className={cx('contact-page', 'light-content')}
                key="successMessage"
                initial={{ x: '50%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '50%', opacity: 0 }}
                transition={{ duration: 0.3, ease: easings.ease, opacity: { duration: 0.2, delay: 0.05 } }} // eslint-disable-line max-len
              >
                {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                { parse(contactFormSuccessMessage) }
              </motion.div>
            )
        }
      </AnimatePresence>
    </div>
  );
}
ContactPageLightContent.propTypes = {
  content: PropTypes.shape({
    contact_form_success_message: PropTypes.string.isRequired,
  }).isRequired,
};


function ContactPageDarkContent({ content: { title, links } }) {
  return (
    <div className={cx('contact-page', 'dark-content')}>
      <h1>{ parse(title) }</h1>
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
  content: PropTypes.shape({
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
});

export async function getStaticProps() {
  return {
    props: { content: await getContactPage() },
    revalidate: 60,
  };
}


export default Contact;
