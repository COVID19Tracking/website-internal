import fetch from 'node-fetch'
import validateCookie from '../../lib/validate-cookie'

export default async (req, res, context) => {
  if (!validateCookie(req)) {
    res.statusCode = 403
    res.end('Login required')
    return
  }
  fetch(
    process.env.COVID_INTERNAL_PRIVATE_BATCH_API.replace(
      '{batch}',
      req.query.batch.toLowerCase(),
    ).replace(
      '{host}',
      req.query.production === 'true'
        ? process.env.COVID_INTERNAL_API_PRODUCTION
        : process.env.COVID_INTERNAL_API_STAGING,
    ),
  )
    .then((response) => response.json())
    .then((result) => {
      res.statusCode = 200
      res.json(result)
    })
    .catch((e) => {
      res.statusCode = 500
      res.json({ error: true })
    })
}
