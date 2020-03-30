/* eslint-disable no-console */

const styles = `
  background: linear-gradient(135deg, #7a92ff, #9b7aff);
  color: #fff;
  display: block;
  text-align: center;
  font-weight: 550;
  font-size: 16px;
  font-family: 'Inter Variable', -apple-system, sans-serif;
  font-weight: 600;
  font-variation-settings: 'wght' 600;
  line-height: 1.5em;
`;

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // These padding values make it line up in Chrome dev tools
  // Firefox will display both at full width with display: block (good!)
  // Safari is good enough whatever
  console.log('%cMade with 🤍 by Luke Deen Taylor', `${styles} padding: 12px 43.5px;`);
  console.log('%chttps://github.com/controversial/luk.ke', `${styles} padding: 12px 24px;`);
}
