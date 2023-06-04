const fs = require('fs')

async function nextActivityAction(userId, interaction) {
  const activityShiftCount = Number(fs.readFileSync(`./database/users/${userId}/city/activity/shifts`, 'ascii'))
  if (activityShiftCount % 100 === 0) if (fs.readFileSync(`./database/users/${userId}/tag`, 'ascii') !== interaction.user.tag) fs.writeFileSync(`./database/users/${userId}/tag`, `${interaction.user.tag}`) 
  if (fs.readFileSync(`./database/users/${userId}/city/mobile`, 'ascii') === 'no') return 'random'
  if (activityShiftCount % 10 === 0) return 'radar'
  else if (activityShiftCount % 5 === 0) return 'move'
  else return 'random'
}

module.exports = {
  nextActivityAction
}