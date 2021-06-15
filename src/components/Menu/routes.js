// Maps menu label to a list of routes for which it should appear “active”

const routes = {
  Hello: ['/'],
  Work: ['/work', '/work/[project]'],
  Contact: ['/contact'],
};

export default routes;
