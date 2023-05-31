const functionsMain = require('./botFunctions/main')

const cannotBan = [] //list of str yser ids
const economyCommands = ['profile', 'craft', 'inventory', 'use', 'item', 'city', 'scavange', 'settings']
const xpCommands = ['craft', 'use', 'scavange']
const economyButtons = ['']
const wildEconomyButtons = ['build', 'activity', 'cityMenu', 'refresh']
const cooldownImmunity = ['']
const userReportWebhook = ''
const dmWebhook = ''
const blacklistWebhook = ''
const supportServerUrl = 'https://discord.gg/'

const botStaffPerms = {
  1: "Developer",
  2: "Admin",
  3: "Moderator",
}

const leaderboardPositionArrayBalance = new Set()
const leaderboardPositionArrayCitizens = new Set()
const leaderboardPositionArrayLevel = new Set()

const badges = {
  earlyUser: {
    name: 'Early User',
    emoji: '<:earlyUser:1066648874296549416>'
  },
}

const colours = {
  cpPurple: 'a744fc',
  alert: 'ff8400',
  error: 'd40700',
  blend: '2f3136',
  warn: 'ffb300',
  success: '00cf0a',
  win: 'ecd008'
}

const settings = {
  home: {
    description: 'Choose a setting to edit',
    name: 'Home',
    file: 'None',
    id: 'home',
    dev: false
  },
  alerts: {
    description: 'Get notified for new developer alerts',
    name: 'Developer Alerts',
    file: 'newAlerts',
    dev: false
  },
  dmNotifs: {
    description: 'Get a DM for notifications',
    name: 'DM Notifications',
    file: 'dmNotifs',
    dev: false
  },
  compactMode: {
    description: 'Make menus more compact',
    name: 'Compact Menus',
    file: 'compactMode',
    dev: false
  },
  hidden: {
    description: 'Hide yourself from public leaderboards',
    name: 'Hide Me',
    file: 'hideMe',
    dev: false
  }
}

const settingsFile = {
  newAlerts: {
    description: 'Get notified for new developer alerts',
    name: 'Developer Alerts',
    id: 'alerts',
    dev: false
  },
  dmNotifs: {
    description: 'Get a DM for notifications',
    name: 'DM Notifications',
    id: 'dmNotifs',
    dev: false
  },
  compactMode: {
    description: 'Make menus more compact',
    name: 'Compact Menus',
    id: 'compactMode',
    dev: false
  },
  hideMe: {
    description: 'Hide yourself from public leaderboards',
    name: 'Hide Me',
    id: 'hidden',
    dev: false
  }
}

const emojis = {
  progressBarEmojis: {
    startFull: '<:startFull:1066436490663571636> ',
    startEmpty: '<:startEmpty:1066436483994636368> ',
    middleFull: '<:middleFull:1066436485974335620> ',
    middleEmpty: '<:middleEmpty:1066436492571971744> ',
    endFull: '<:endFull:1066436487362662450> ',
    endEmpty: '<:endEmpty:1066436488604160050> '
  },
  notFound: '<:Glitch:1031134074263314443>',
  reply: '<:reply:1066439131997163551>',
  reply_cont: '<:reply_continued:1066439134161416303>',
  reload: '',
  starterCrate: '',
  clay: '',
  bricks: '',
  spareParts: '',
  metal: '',
  plastic: '',
  tools: '',
  buildingSupplies: '',
  wood: '',
  questCrate: ''
}

const commandCooldownTexts = [
  {
    commandName: "activity",
    title: "",
    body: "Your city needs time. You can do another activity in {timeAll}",
    colour: colours.blend
  }
]

const materialsBasic = [
  {
    name: 'Building Supplies',
    id: 'building supplies',
    fileId: 'buildingSupplies',
    emoji: emojis.buildingSupplies,
    amount: 1
  },
  {
    name: 'Tools',
    id: 'tools',
    fileId: 'tools',
    emoji: emojis.tools,
    amount: 3
  },
]

const scavangeFails = [
  `Your scavenging party got scared and ran back to your city screaming`,
  `The scavenging party got tired, lay down and went to sleep under a tree`,
  `Someone had a birthday in your city, the scavengers went to that party instead`,
  `Your scavengers didn't appreciate you telling them to go out scavanging`,
  `It's raining outside, your scavengers don't deserve to get wet`
]

const scavangeLosses = [
  `Your scavenging party found a better looking city and went there instead. You lost {amount} citizens`
]

const scavangeCoins = [
  `Your scavenging party found {amount} coins in the mud`,
  `{amount} coins got found in an old wallet`
]

const scavangeItems = [
  `Your scavenging party found {item} in the mud`,
  `Your scavenging party found {item} hidden in the grass`,
  `Woah, your scavengers found {item} in the wilderness`,
]

module.exports = {
  colours,
  functionsMain,
  emojis,
  cannotBan,
  economyCommands,
  economyButtons,
  scavangeFails,
  scavangeLosses,
  scavangeCoins,
  scavangeItems,
  cooldownImmunity,
  xpCommands,
  userReportWebhook,
  dmWebhook,
  commandCooldownTexts,
  materialsBasic,
  blacklistWebhook,
  supportServerUrl,
  settings,
  settingsFile,
  botStaffPerms,
  wildEconomyButtons,
  badges,
  leaderboardPositionArrayBalance,
  leaderboardPositionArrayCitizens,
  leaderboardPositionArrayLevel
}
