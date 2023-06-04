const fs = require('fs')
const { permissionCheck } = require('./permissionCheck')

function maintenanceCheck(id, module) {
  if (permissionCheck(id, 3) === true) {
    if (fs.existsSync(`./database/bot/maintenance/${module}`)) return true
  }
}

module.exports = {
  maintenanceCheck
}