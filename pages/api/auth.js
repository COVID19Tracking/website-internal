import fetch from 'node-fetch'

import sha256 from 'crypto-js/sha256'

export default (req, res) => {
  const authBuffer = new Buffer(
    `${process.env.SLACK_CLIENT}:${process.env.SLACK_SECRET}`,
  )

  fetch(
    `https://slack.com/api/oauth.v2.access?redirect_uri=${encodeURIComponent(
      process.env.authEndpoint,
    )}&code=${req.query.code}`,
    {
      headers: {
        Authorization: `Basic ${authBuffer.toString('base64')}`,
      },
    },
  )
    .then((result) => result.json())
    .then((response) => {
      if (response.ok) {
        const cookie = `covidUser=${response.authed_user.id}:${sha256(
          response.authed_user.id + process.env.AUTH_SALT,
        )}; Path=/`
        res.writeHead(302, {
          'Set-cookie': cookie,
          Location: '/',
        })
        res.end('Redirecting you')
      } else {
        res.statusCode = 403
        res.json(response)
      }
    })
}
