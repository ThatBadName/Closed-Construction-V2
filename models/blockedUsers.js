const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
   blockedById: String,
   blockedUserId: String,
}, {
   timestamps: true
})

const name = 'Blocked User'
module.exports = mongoose.models[name] || mongoose.model(name, schema)