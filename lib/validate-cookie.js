import sha256 from 'crypto-js/sha256'

module.exports = (req) => {
  if (process.env.COVID_INTERNAL_DISABLE_AUTH) {
    return 'local'
  }
  const { covidUser } = req.cookies
  if (!covidUser) {
    return false
  }
  const userParts = covidUser.split(':')
  return (
    userParts[1] === sha256(userParts[0] + process.env.AUTH_SALT).toString()
  )
}
