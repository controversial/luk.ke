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

let totalStars = 0;
let fetchedAt = 0;

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

export async function getTotalStars() {
  // Only actually re-fetch if it's been an hour since the last time (or if the lambda restarted)
  if ((Date.now() - fetchedAt) > 1000 * 60 * 60) {
    totalStars = await fetchStars();
    fetchedAt = Date.now();
  }
  return totalStars;
}

export default async (req, res) => {
  // Get the total number of stars
  const total = await getTotalStars();
  // As an extra step beyond the 1-hour cache we set up in memory, we provide cache instructions to
  // the Zeit CDN so that when we haven't re-fetched the value, the serverless function isn't run at
  // all, instead its last response is served from the edge network.
  res.setHeader('Cache-Control', 'max-age=0, s-maxage=3600, stale-while-revalidate');
  // send it
  res.status(200).json({ totalStars: total });
};
