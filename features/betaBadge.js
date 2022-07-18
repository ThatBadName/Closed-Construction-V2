let enabled = true //! When not in beta make sure this is false

const profileSchema = require('../models/userProfile')

module.exports = (client) => {
        client.on('interactionCreate', async (interaction) => {
            if (enabled === false) return
            const badgeToAdd = "<:betaUser:995092836879978589>"
            const userID = interaction.user.id

            const result = await profileSchema.findOne({
                userId: userID
            })
            if (!result) {
                profileSchema.create({
                    userId: userID,
                    badges: [{
                        _id: badgeToAdd,
                    }]
                })
            } else {
                if (!result.badges.find(badgeName => badgeName._id === badgeToAdd)) {
                    result.badges.push({
                        _id: badgeToAdd,
                    })
                    result.save()
                } else {}
            }
        })
    },

    module.exports.config = {
        dbName: 'AUTO BETA BADGE',
        displayName: 'Auto Beta Badge',
    }