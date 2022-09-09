const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   userId: String,
   inGameWithId: String,
   message: String
}, {
   timestamps: false
})

const name = 'check trade'
module.exports = mongoose.models[name] || mongoose.model(name, schema)