const { Parser } = require('htmlparser2');
const { DomHandler } = require('domhandler');
const { getOuterHTML } = require('domutils'); // TODO: replace with dom-serializer

module.exports = function addClass(className, html) {
  return new Promise((resolve) => {
    // Handler function is called once DOM is parsed
    const handler = new DomHandler((error, dom) => {
      // If we can't get anything meaningful out of the input string, return the input string as-is
      if (error || !dom?.length) resolve(html);
      // Otherwise, add the className and return the HTML representation of the result
      else {
        dom[0].attribs.class = `${dom[0].attribs.class || ''} ${className}`.trim();
        resolve(getOuterHTML(dom));
      }
    });
    // Parse HTML using our handler function
    const parser = new Parser(handler);
    parser.write(html);
    parser.end();
  });
};
