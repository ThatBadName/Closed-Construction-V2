const {
    inBeta
} = require('../../../config.json')
const profileSchema = require('../../models/userProfile')

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(client, interaction) {
        if (inBeta === false) return
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
    }
}