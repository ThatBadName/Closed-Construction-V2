const recentCommandSchema = require('../models/recentCommands')

module.exports = (client) => {
    const check = async () => {
        const query = {
            expires: {
                $lt: new Date()
            },
        }

        await recentCommandSchema.deleteMany(query)
        setTimeout(check, 1000 * 60)
    }
    check()
}

module.exports.config = {
    dbName: 'EXPIRED COMMANDS',
    displayName: 'Expired Commands'
}