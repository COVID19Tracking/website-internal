const withSass = require('@zeit/next-sass')
const withLess = require('@zeit/next-less')

const isProd = process.env.NODE_ENV === 'production'

// fix: prevents error when .less files are required by node
if (typeof require !== 'undefined') {
  require.extensions['.less'] = (file) => {}
}

module.exports = withLess(
  withSass({
    lessLoaderOptions: {
      javascriptEnabled: true,
    },
    target: 'serverless',
    env: {
      authEndpoint: process.env.NETLIFY
        ? 'https://internal.covidtracking.com/api/auth'
        : 'http://localhost:3000/api/auth',
    },
  }),
)
