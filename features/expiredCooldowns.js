const commandCooldowns = require('../models/cooldowns')
const robCooldowns = require('../models/robCooldowns')
const robCooldownsSus = require('../models/robCooldownsSus')

module.exports = (client) => {
    const check = async () => {
        const query = {
            expires: {
                $lt: new Date()
            },
        }

        await commandCooldowns.deleteMany(query)
        await robCooldowns.deleteMany(query)
        await robCooldownsSus.deleteMany(query)
        setTimeout(check, 1000 * 1)
    }
    check()
}

module.exports.config = {
    dbName: 'COMMAND_COOLDOWNS',
    displayName: 'Expired Cooldowns'
}