const fs = require('fs')
function optionBuilder(userId) {
  let optionArr = []
  let hasOption = false
  if (fs.readFileSync(`./database/users/${userId}/city/imageUnlocked`, 'ascii') === 'no' && Number(fs.readFileSync(`./database/users/${userId}/level`)) >= 5) {
    optionArr.push({label: '[Cost: 50,000] City Icon', description: 'Unlock the ability to add an image to your city', value: 'cityIcon'})
    hasOption = true
  } 
  if (Number(fs.readFileSync(`./database/users/${userId}/city/radar`, 'ascii') < 15) && fs.readFileSync(`./database/users/${userId}/city/mobile`) === 'yes') {
    optionArr.push({label: `[Cost: ${(Number(fs.readFileSync(`./database/users/${userId}/city/radar`, 'ascii')) * 50000 + 100000).toLocaleString()}] Upgrade Radar`, description: `Your city can detect cities from further away. Current lvl: ${Number(fs.readFileSync(`./database/users/${userId}/city/radar`, 'ascii'))}`, value: 'upgradeRadar'})
    hasOption = true
  }
  return optionArr
}

module.exports = {
  optionBuilder
}