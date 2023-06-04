const fs = require('fs')

let deleteMeFiles = [
  `./database/blacklist/DELETE_ME`,
  `./database/blacklistArchive/DELETE_ME`,
  `./database/commands/logs/DELETE_ME`,
  `./database/market/DELETE_ME`,
  `./database/quests/daily/easy/users/DELETE_ME`,
  `./database/quests/daily/medium/users/DELETE_ME`,
  `./database/quests/daily/hard/users/DELETE_ME`,
  `./database/quests/weekly/easy/users/DELETE_ME`,
  `./database/quests/weekly/medium/users/DELETE_ME`,
  `./database/quests/weekly/hard/users/DELETE_ME`,
  `./database/quests/vip/0/users/DELETE_ME`,
  `./database/quests/vip/1/users/DELETE_ME`,
  `./database/users/DELETE_ME`
]

for (const file of deleteMeFiles()) {
  if (fs.existsSync(file)) {
    console.log(`Removing file: ${file}`)
    fs.rmSync(file, {recursive:true})
  }
}

console.log(`DELETE_ME files have now been deleted, you can run the bot using "node src/bot.js"`)