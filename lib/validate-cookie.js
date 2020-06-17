import sha256 from 'crypto-js/sha256'

module.exports = (req) => {
  const { covidUser } = req.cookies
  if (!covidUser) {
    return false
  }
  const userParts = covidUser.split(':')
  return (
    userParts[1] === sha256(userParts[0] + process.env.AUTH_SALT).toString()
  )
}
