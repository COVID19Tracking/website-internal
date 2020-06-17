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
      authPath: process.env.NETLIFY
        ? 'covid-website-internal.netlify.app'
        : 'localhost:3000',
    },
  }),
)
