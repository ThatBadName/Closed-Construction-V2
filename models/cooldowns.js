const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   userId: String,
   expires: Date,
   command: String
}, {
   timestamps: false
})

const name = 'commandCooldown'
module.exports = mongoose.models[name] || mongoose.model(name, schema)