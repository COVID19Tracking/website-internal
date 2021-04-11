import { BigQuery } from '@google-cloud/bigquery'

const credentials = JSON.parse(process.env.BIGQUERY_CREDENTIALS)
const client = new BigQuery({
  projectId: credentials.project_id,
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
})

const query = `WITH latest AS
(SELECT MAX(date) AS max_date, state, date_used
FROM \`covid-tracking-project-data.taco.avocado_latest\`
GROUP BY state,date_used
)SELECT avocado_latest.*
FROM latest JOIN \`covid-tracking-project-data.taco.avocado_latest\` avocado_latest
ON latest.max_date=avocado_latest.date
AND latest.state=avocado_latest.state
AND latest.date_used=avocado_latest.date_used
ORDER BY latest.state , latest.max_date DESC`

export default async (req, res, context) => {
  const [job] = await client.createQueryJob({
    query,
    location: 'US',
  })
  const [rows] = await job.getQueryResults()
  res.json(rows)
}
