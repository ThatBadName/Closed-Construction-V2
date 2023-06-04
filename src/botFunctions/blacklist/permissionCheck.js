const fs = require('fs')

function permissionCheck(id, requiredLevel) {
  if (!fs.existsSync(`./database/bot/staff/${id}`)) return true
  const level = fs.readFileSync(`./database/bot/staff/${id}/rank`, 'ascii')
  if (requiredLevel < level) return true
}

module.exports = {
  permissionCheck
}