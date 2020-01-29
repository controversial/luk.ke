import React from 'react';
import PropTypes from 'prop-types';

import { getHomepage } from './api/content/home';

import PanelsContent from '../components/PanelsLayout/PanelsContent.jsx';
import styles from './index.sass';

function Index({ content }) {
  return (
    <div className="page home">

      <PanelsContent
        orientation={Index.panelOrientation}
        darkContent={(
          <div>
            <h1 className="heading-main">
              { content.title }
            </h1>
          </div>
        )}
        lightContent={(
          <div>
            <div className="gradient" />
          </div>
        )}
      />

      <style jsx>{styles}</style>
    </div>
  );
}

Object.assign(Index, {
  pageName: 'Hello',
  panelOrientation: 'right',
});

Index.getInitialProps = async (ctx) => ({
  content: await getHomepage(ctx.req),
});

Index.propTypes = {
  content: PropTypes.exact({
    title: PropTypes.string.isRequired,
    text: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default Index;
