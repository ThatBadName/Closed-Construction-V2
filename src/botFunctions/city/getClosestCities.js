const fs = require('fs')

async function getClosestCity(interaction, myId, myPos, range, amount, minDistance) {
  if (!minDistance) minDistance = 100
  let cityArr = []
  const dir = fs.readdirSync(`./database/users`)
  if (dir.size < amount) amount = dir.size
  for (const folder of dir) {
    if (cityArr.length <= amount) {
      const id = folder
      if (fs.readFileSync(`./database/users/${interaction.user.id}/city/mobile`, 'ascii') === 'no') continue
      if (fs.readFileSync(`./database/users/${folder}/city/hostile`, 'ascii') === 'no') continue
      if (id === myId) continue
      const pos = fs.readFileSync(`./database/users/${folder}/city/position`, 'ascii')
      const distance = Math.abs(myPos - Number(pos))
      if (distance <= minDistance) continue
      const name = fs.readFileSync(`./database/users/${folder}/cityName`, 'ascii')
      if (inRange(Number(pos), myPos - range, myPos + range)) cityArr.push({name, id, distance})
    } else break
  }

  return cityArr
}

function inRange(x, min, max) {
  return ((x-min)*(x-max) <= 0);
}

module.exports = {
  getClosestCity
}