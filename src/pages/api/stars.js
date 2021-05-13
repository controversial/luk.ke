// This GraphQL query requests the star count of each of my 100 most-starred repositories.
/* eslint-disable max-len */
const query = `
query {
  viewer {
    repositories(privacy:PUBLIC, isFork: false, first:100, orderBy: { direction:DESC, field: STARGAZERS }) {
      edges { node { stargazers { totalCount } } }
    }
  }
}
`;
/* eslint-enable */

export async function getTotalStars() {
  // Send the GraphQL query to the GitHub API
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  }).then((r) => r.json());

  // Dig through the layers of GraphQL nesting
  const repos = response?.data?.viewer?.repositories?.edges || [];
  // Count the total number of stars and return
  return repos
    .map(({ node: repo }) => repo.stargazers.totalCount)
    .reduce((a, b) => a + b, 0);
}

export default async function routeHandler(req, res) {
  // Get the total number of stars
  const total = await getTotalStars();
  // Instruct the Zeit CDN to cache the response for a minute so that we don't hit the Github API
  // too frequently
  res.setHeader('Cache-Control', 'max-age=0, s-maxage=60, stale-while-revalidate');
  // send it
  res.status(200).json({ totalStars: total });
}
