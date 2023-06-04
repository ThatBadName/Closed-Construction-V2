const fs = require('fs')
const { cannotBan } = require('../../constants')

function checkEcoBan(userId) {
  if (cannotBan.includes(userId)) return null
  if (!fs.existsSync(`./database/blacklist/${userId}`)) return null
  if (fs.readFileSync(`./database/blacklist/${userId}/ecoBan`, 'ascii') === 'yes') return {
    reason: fs.readFileSync(`./database/blacklist/${userId}/reason`, 'ascii'),
    type: fs.readFileSync(`./database/blacklist/${userId}/type`, 'ascii'),
    case: fs.readFileSync(`./database/blacklist/${userId}/caseId`, 'ascii'),
    expires: fs.readFileSync(`./database/blacklist/${userId}/expires`, 'ascii')
  }
  else return null
}

function checkBotBan(userId) {
  if (cannotBan.includes(userId)) return null
  if (!fs.existsSync(`./database/blacklist/${userId}`)) return null
  if (fs.readFileSync(`./database/blacklist/${userId}/botBan`, 'ascii') === 'yes') return {
    reason: fs.readFileSync(`./database/blacklist/${userId}/reason`, 'ascii'),
    type: fs.readFileSync(`./database/blacklist/${userId}/type`, 'ascii'),
    case: fs.readFileSync(`./database/blacklist/${userId}/caseId`, 'ascii'),
    expires: fs.readFileSync(`./database/blacklist/${userId}/expires`, 'ascii')
  }
  else return null
}

function checkReportBan(userId) {
  if (cannotBan.includes(userId)) return null
  if (!fs.existsSync(`./database/blacklist/${userId}`)) return null
  if (fs.readFileSync(`./database/blacklist/${userId}/reportBan`, 'ascii') === 'yes') return {
    reason: fs.readFileSync(`./database/blacklist/${userId}/reason`, 'ascii'),
    type: fs.readFileSync(`./database/blacklist/${userId}/type`, 'ascii'),
    case: fs.readFileSync(`./database/blacklist/${userId}/caseId`, 'ascii'),
    expires: fs.readFileSync(`./database/blacklist/${userId}/expires`, 'ascii')
  }
  else return null
}

module.exports = {
  checkEcoBan,
  checkBotBan,
  checkReportBan
}