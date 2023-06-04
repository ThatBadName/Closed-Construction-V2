const fs = require('fs')
const { createProfileId } = require('../main')

function rename(userId, name, client) {
  if (!fs.existsSync(`./database/${userId}`)) createProfileId(userId, client)
  fs.writeFileSync(`./database/users/${userId}/cityName`, name)
}

function newSlogan(userId, name, client) {
  if (!fs.existsSync(`./database/${userId}`)) createProfileId(userId, client)
  fs.writeFileSync(`./database/users/${userId}/city/slogan`, name)
}

function newImage(userId, name, client) {
  if (!fs.existsSync(`./database/${userId}`)) createProfileId(userId, client)
  fs.writeFileSync(`./database/users/${userId}/city/image`, name)
}

module.exports = {
  rename,
  newSlogan,
  newImage
}