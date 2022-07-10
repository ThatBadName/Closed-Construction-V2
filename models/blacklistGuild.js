const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   guildId: String,
   reason: String,
   expires: Date,
   duration: {
      type: String,
      default: 'Eternal'
   }
}, {
   timestamps: true
})

const name = 'Blacklisted Guilds'
module.exports = mongoose.models[name] || mongoose.model(name, schema)