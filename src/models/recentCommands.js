const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   userId: String,
   command: String,
   commandInfo: String,
   expires: Date,
   Id: String,
   guildName: String,
   guildId: String,
   suspicious: {
      type: Boolean,
      default: false
   },
   staffCommand: {
      type: Boolean,
      default: false
   },
}, {
   timestamps: true
})

const name = 'Recent Command'
module.exports = mongoose.models[name] || mongoose.model(name, schema)