const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   guildId: String,
   expires: Date
}, {
   timestamps: false
})

const name = 'premium guild'
module.exports = mongoose.models[name] || mongoose.model(name, schema)