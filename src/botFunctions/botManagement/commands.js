const fs = require('fs')
const path = require("path");
const {
  economyCommands
} = require('../../constants')
const getMostRecentFile = (dir) => {
  const files = orderReccentFiles(dir);
  return files.length ? files[0] : undefined;
};

const orderReccentFiles = (dir) => {
  return fs.readdirSync(dir)
    .filter((file) => fs.lstatSync(path.join(dir, file)).isDirectory())
    .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
};

function commandTrackerAdd(userId, location, command, information) {
  if (!fs.existsSync(`./database/users/${userId}`)) return
  
  let commandTrackingType = fs.readFileSync(`./database/users/${userId}/admin/trackCommands`, 'ascii')
  if (commandTrackingType === 'never') return
  if (!fs.existsSync(`./database/commands/logs/${userId}`)) fs.mkdir(`./database/commands/logs/${userId}`, (() => {}))
  if (commandTrackingType === 'economy') {
    if (!economyCommands.includes(command)) return
    let password = [];
    let possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let passString
    let passWordLength = 7
    for (let i = 0; i < passWordLength; i++) {
      password.push(possible.charAt(Math.floor(Math.random() * possible.length)));
    }
    passString = password.join('')

    var dateDaily = new Date()
    var nowUTC = Date.UTC(dateDaily.getUTCFullYear(), dateDaily.getUTCMonth(), dateDaily.getUTCDate(), dateDaily.getUTCHours(), dateDaily.getUTCMinutes(), dateDaily.getUTCSeconds())
    fs.mkdir(`./database/commands/logs/${userId}/${passString}`, (() => {
      fs.writeFileSync(`./database/commands/logs/${userId}/${passString}/command`, command)
      fs.writeFileSync(`./database/commands/logs/${userId}/${passString}/information`, information)
      fs.writeFileSync(`./database/commands/logs/${userId}/${passString}/location`, location)
      fs.writeFileSync(`./database/commands/logs/${userId}/${passString}/created`, `${nowUTC}`)
    }))

    const oldest = getMostRecentFile(`./database/commands/logs/${userId}`)
    if (fs.readdirSync(`./database/commands/logs/${userId}`).length >= 250) fs.rm(`./database/commands/logs/${userId}/${oldest.file}`, {
      recursive: true
    }, (() => {}))
  } else if (commandTrackingType === 'all') {
    let password = [];
    let possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let passString
    let passWordLength = 7
    for (let i = 0; i < passWordLength; i++) {
      password.push(possible.charAt(Math.floor(Math.random() * possible.length)));
    }
    passString = password.join('')

    var dateDaily = new Date()
    var nowUTC = Date.UTC(dateDaily.getUTCFullYear(), dateDaily.getUTCMonth(), dateDaily.getUTCDate(), dateDaily.getUTCHours(), dateDaily.getUTCMinutes(), dateDaily.getUTCSeconds())
    fs.mkdir(`./database/commands/logs/${userId}/${passString}`, (() => {
      fs.writeFileSync(`./database/commands/logs/${userId}/${passString}/command`, command)
      fs.writeFileSync(`./database/commands/logs/${userId}/${passString}/information`, information)
      fs.writeFileSync(`./database/commands/logs/${userId}/${passString}/location`, location)
      fs.writeFileSync(`./database/commands/logs/${userId}/${passString}/created`, `${nowUTC}`)
    }))

    const oldest = getMostRecentFile(`./database/commands/logs/${userId}`)
    if (fs.readdirSync(`./database/commands/logs/${userId}`).length >= 250) fs.rm(`./database/commands/logs/${userId}/${oldest.file}`, {
      recursive: true
    }, (() => {}))
  }

}

module.exports = {
  commandTrackerAdd
}