import { WebClient } from '@slack/web-api'
import { DateTime } from 'luxon'
import validateCookie from '../../lib/validate-cookie'

const channel = process.env.COVID_INTERNAL_SLACK_CHANNEL

export default async (req, res, context) => {
  if (!validateCookie(req)) {
    res.statusCode = 403
    res.end('Login required')
    return
  }

  const { covidUser } = req.cookies
  const user = covidUser.split(':')[0]

  const startThread = `--- Manual Screenshots ${DateTime.local().toFormat(
    'LL/dd/yy',
  )} ---`
  const web = new WebClient(process.env.COVID_INTERNAL_SLACK_TOKEN)
  const slackUser = await web.users.info({ user })
  const convos = await web.conversations.history({
    channel,
    oldest: DateTime.local().minus({ days: 5 }).toMillis() / 1000,
  })
  let threadTimestamp = false
  convos.messages.forEach((message) => {
    if (message.text.search(startThread) > -1) {
      threadTimestamp = message.ts
    }
  })
  if (!threadTimestamp) {
    const message = await web.chat.postMessage({
      channel,
      text: startThread,
    })
    threadTimestamp = message.message.ts
  }
  web.chat.postMessage({
    channel,
    unfurl_links: false,
    unfurl_media: false,
    thread_ts: threadTimestamp,
    text: `<${req.body.screenshot}|${req.body.state} - ${req.body.dataType} - ${
      req.body.coreDataType
    }>
Date & time: ${DateTime.fromISO(req.body.dateTime)
      .setZone('America/New_York')
      .toFormat('LL/dd/yy ttt')}
Uploaded by: ${slackUser.user.profile.display_name}
    `,
  })
  console.log()
  res.statusCode = 200
  res.json({ done: true })
}
