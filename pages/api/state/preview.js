const fetch = require('node-fetch')

export default async (req, res) => {
  fetch(process.env.COVID_INTERNAL_PRIVATE_STATE_API)
    .then((response) => response.json())
    .then((result) => {
      res.statusCode = 200
      res.json(
        result.filter(
          (row) => row.state.toLowerCase() === req.query.state.toLowerCase(),
        ),
      )
    })
    .catch((e) => {
      res.statusCode = 500
      res.json({ error: true })
    })
}
