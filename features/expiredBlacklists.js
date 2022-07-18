const blacklistedGuilds = require('../models/blacklistGuild')
const blacklistedUsers = require('../models/blacklistUser')

module.exports = (client) => {
    const check = async () => {
        const query = {
            expires: {
                $lt: new Date()
            },
        }

        await blacklistedGuilds.deleteMany(query)
        await blacklistedUsers.deleteMany(query)
        setTimeout(check, 1000 * 10)
    }
    check()
}

module.exports.config = {
    dbName: 'EXPIRED BLACKLISTS',
    displayName: 'Expired Blacklists'
}