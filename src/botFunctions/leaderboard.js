const fs = require('fs')
const { checkSettings, abbreviateNumber } = require("./main")

async function updateLeaderboard(userId) {
  const users = fs.readdirSync(`./database/users`, 'ascii')
  let userArr = []
  let limit = 15
  for (const user of users) {
    let tag
    if (checkSettings(fs.readFileSync(`./database/users/${user}/id`, 'ascii')).hideMe === false) tag = fs.readFileSync(`./database/users/${user}/tag`, 'ascii')
    else tag = '*Hidden User*'
    userArr.push({
      id: fs.readFileSync(`./database/users/${user}/id`, 'ascii'),
      tag,
      balance: Number(fs.readFileSync(`./database/users/${user}/balance`, 'ascii')),
      level: Number(fs.readFileSync(`./database/users/${user}/level`, 'ascii')),
      citizens: Number(fs.readFileSync(`./database/users/${user}/citizens`, 'ascii'))
    })
  }

  let topBalArr = await topValuesBalance(userArr, limit)
  let topLvlArr = await topValuesLevel(userArr, limit)
  let topPopArr = await topValuesCitizens(userArr, limit)
  fs.writeFileSync(`./database/leaderboard/balanceLeaderboard`, `${topBalArr.slice(0, limit).map((user, i) => `${ranking(i)}\`${abbreviateNumber(user.balance)}\` - ${user.tag}`).join('\n')}`)
  fs.writeFileSync(`./database/leaderboard/citizenLeaderboard`, `${topPopArr.slice(0, limit).map((user, i) => `${ranking(i)}\`${abbreviateNumber(user.citizens)}\` - ${user.tag}`).join('\n')}`)
  fs.writeFileSync(`./database/leaderboard/levelLeaderboard`, `${topLvlArr.slice(0, limit).map((user, i) => `${ranking(i)}\`${user.level.toLocaleString()}\` - ${user.tag}`).join('\n')}`)

  function ranking(i) {
    if (i === 0) return ':crown: '
    if (i === 1) return ':second_place: '
    if (i === 2) return ':third_place: '
    return ':small_orange_diamond: '
  }
  return {
    balUserArr: topBalArr,
    lvlUserArr: topLvlArr,
    popUserArr: topPopArr,
  }
}
async function topValuesBalance(arr, n) {
  if (n > arr.length) n = arr.length
  return arr
    .slice()
    .sort((a, b) => {
      return b.balance - a.balance
    })
}
async function topValuesLevel(arr, n) {
  if (n > arr.length) n = arr.length
  return arr
    .slice()
    .sort((a, b) => {
      return b.level - a.level
    })
}
async function topValuesCitizens(arr, n) {
  if (n > arr.length) n = arr.length
  return arr
    .slice()
    .sort((a, b) => {
      return b.citizens - a.citizens
    })
}

module.exports = {
  updateLeaderboard
}