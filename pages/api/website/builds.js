const NetlifyAPI = require('netlify')
const client = new NetlifyAPI(process.env.COVID_INTERNAL_NETLIFY_TOKEN)

export default async (req, res) => {
  const deploys = await client.listSiteDeploys({
    site_id: process.env.COVID_INTERNAL_NETLIFY_SITE,
  })
  const results = []
  deploys.forEach((deploy) => {
    if (deploy.context === 'production') {
      results.push({
        time: deploy.published_at,
        title: deploy.title,
        buildTime: deploy.deploy_time,
        url: `https://${deploy.id}--upbeat-lovelace-3e9fff.netlify.app/`,
      })
    }
  })
  res.statusCode = 200
  res.json(results)
}
