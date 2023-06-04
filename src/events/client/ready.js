const {
    ActivityType
} = require('discord.js')
const fs = require('fs')
const {
    maintenanceCheck
} = require('../../botFunctions/blacklist/maintenanceCheck')
const {
    blacklistLog
} = require('../../botFunctions/botManagement/blacklistLogs')
const {
    updateLeaderboard
} = require('../../botFunctions/leaderboard')
const {
    createEasyQuest
} = require('../../botFunctions/quests/generation/daily/createEasyQuest')
const {
    createHardQuest
} = require('../../botFunctions/quests/generation/daily/createHardQuest')
const {
    createMediumQuest
} = require('../../botFunctions/quests/generation/daily/createMediumQuest')
const {
    leaderboardPositionArrayBalance,
    leaderboardPositionArrayCitizens,
    leaderboardPositionArrayLevel
} = require('../../constants')

module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        console.log(`[Startup] ${client.user.username} is online`)

        let current = 'user'
        const rotate = async () => {
            if (current === 'user') updateStatusHelp()
            else if (current === 'server') updateStatusUser()
            else if (current === 'help') updateStatusRegistered()
            else if (current === 'registered') updateStatusServer()

            setTimeout(rotate, 60000)
        }
        rotate()

        const updateQuests = async () => {
            if (fs.readFileSync(`./database/quests/refresh/daily`, 'ascii') < new Date()) {
                createEasyQuest('daily')
                createMediumQuest('daily')
                createHardQuest('daily')

                var d = new Date()
                d.setUTCDate(d.getUTCDate() + 1)
                d.setUTCHours(0)
                d.setUTCMinutes(0)
                d.setUTCSeconds(0)
                fs.writeFileSync(`./database/quests/refresh/daily`, `${Date.parse(d)}`)
            }
            if (fs.readFileSync(`./database/quests/refresh/weekly`, 'ascii') < new Date()) {
                createEasyQuest('weekly')
                createMediumQuest('weekly')
                createHardQuest('weekly')

                var d = new Date()
                d.setUTCDate(d.getUTCDate() + (7 - d.getUTCDay()) % 7 + 1)
                d.setUTCHours(0)
                d.setUTCMinutes(0)
                d.setUTCSeconds(0)
                fs.writeFileSync(`./database/quests/refresh/weekly`, `${Date.parse(d)}`)
            }
            setTimeout(updateQuests, 1000 * 60)
        }
        updateQuests()

        const updateLeaderboardTimer = async () => {
            const arrays = await updateLeaderboard()
            leaderboardPositionArrayBalance.add(arrays.balUserArr)
            leaderboardPositionArrayCitizens.add(arrays.popUserArr)
            leaderboardPositionArrayLevel.add(arrays.lvlUserArr)

            setTimeout(updateLeaderboardTimer, 1000 * 60 * 5)
        }
        updateLeaderboardTimer()


        const blacklistCheck = async () => {
            if (maintenanceCheck(null, 'Blacklist') === true) return
            let results = []
            let blacklists = fs.readdirSync(`./database/blacklist`, 'ascii')
            for (const listing of blacklists) {
                if (fs.readFileSync(`./database/blacklist/${listing}/expires`, 'ascii') === 'never') continue
                if (fs.readFileSync(`./database/blacklist/${listing}/expires`, 'ascii') > new Date()) continue
                results.push({
                    id: listing,
                    caseId: fs.readFileSync(`./database/blacklist/${listing}/caseId`, 'ascii')
                })
            }
            for (const result of results) {
                const {
                    id
                } = result
                if (!fs.existsSync(`./database/blacklist/${id}`)) continue
                fs.rm(`./database/blacklist/${id}`, {
                    recursive: true
                }, (() => {}))
                fs.writeFileSync(`./database/blacklistArchive/${id}-${result.caseId}/active`, 'no')
                let reason = fs.readFileSync(`./database/blacklistArchive/${id}-${result.caseId}/reason`, 'ascii')
                const type = fs.readFileSync(`./database/blacklistArchive/${id}-${result.caseId}/type`, 'ascii')
                reason += `\n\n*Automated removal`
                await blacklistLog(null, id, null, reason, result.caseId, 'a', type, client, 'remove', 'no')
            }
            setTimeout(blacklistCheck, 60000)
        }
        blacklistCheck()

        function updateStatusServer() {
            client.user.setPresence({
                activities: [{
                    name: `${client.guilds.cache.size.toLocaleString()} servers`,
                    type: ActivityType.Watching
                }],
                status: 'dnd',
            })
            current = 'server'
        }

        function updateStatusUser() {
            client.user.setPresence({
                activities: [{
                    name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString()} users`,
                    type: ActivityType.Watching
                }],
                status: 'dnd',
            })
            current = 'user'
        }

        function updateStatusHelp() {
            client.user.setPresence({
                activities: [{
                    name: `/help`,
                    type: ActivityType.Playing
                }],
                status: 'dnd',
            })
            current = 'help'
        }
        async function updateStatusRegistered() {
            const amount = fs.readdirSync('./database/users').length
            client.user.setPresence({
                activities: [{
                    name: `${amount.toLocaleString()} registered users`,
                    type: ActivityType.Listening
                }],
                status: 'dnd',
            })
            current = 'registered'
        }
    }
}