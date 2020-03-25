import fetch from 'isomorphic-unfetch';

// This GraphQL query requests the star count of each of my 100 most-starred repositories.
const query = `
query {
  viewer {
    repositories(privacy:PUBLIC, isFork: false, first:100, orderBy: { direction:DESC, field: STARGAZERS }) {
      edges { node { stargazers { totalCount } } }
    }
  }
}
`;

async function fetchStars() {
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

export default async (req, res) => {
  const totalStars = await fetchStars();
  res.status(200).json({ totalStars });
};
