const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   userId: String,
   expires: Date,
   userRobbedId: String
}, {
   timestamps: false
})

const name = 'robCooldown'
module.exports = mongoose.models[name] || mongoose.model(name, schema)