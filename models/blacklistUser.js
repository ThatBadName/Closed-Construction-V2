const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   userId: String,
   reason: String,
   expires: Date,
   duration: {
      type: String,
      default: 'Eternal'
   }
}, {
   timestamps: true
})

const name = 'Blacklisted Users'
module.exports = mongoose.models[name] || mongoose.model(name, schema)