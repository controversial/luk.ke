import React from 'react';
import PropTypes from 'prop-types';

import parse from 'html-react-parser';

import { getHomepage } from './api/content/home';

import AgeCounter from '../components/AgeCounter/AgeCounter.jsx';
import PanelsContent from '../components/PanelsLayout/PanelsContent.jsx';

import styles from './index.sass';


// Replacement function for html-react-parser. If we encounter an element with class name 'age', we
// replace it with an instance of AgeCounter
// eslint-disable-next-line react/prop-types
const replaceAge = ({ attribs }) => attribs?.['class'] === 'age' && <AgeCounter />;


function Index({ content }) {
  return (
    <div className="page home">

      <PanelsContent
        orientation={Index.panelOrientation}
        darkContent={(
          <div>
            { parse(content.title) }
            {
              content.text.map((p) => (
                <React.Fragment key={p}>
                  { parse(p, { replace: replaceAge }) }
                </React.Fragment>
              ))
            }
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
