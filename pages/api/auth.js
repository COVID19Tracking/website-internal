import fetch from 'node-fetch'

export default (req, res) => {
  fetch(
    `https://slack.com/api/oauth.v2.access?client_id=${process.env.SLACK_CLIENT}&client_secret=${process.env.SLACK_SECRET}&code=${req.query.code}`,
  )
    .then((result) => result.json())
    .then((client) => {
      console.log(client)
      const cookie = `covidUser=client; Path=/`
      res.setHeader('Set-cookie', cookie)
      res.setHeader('Location', '/')
      res.end('')
    })
}
