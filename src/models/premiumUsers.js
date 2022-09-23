const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   userId: String,
   expires: Date
}, {
   timestamps: false
})

const name = 'premium user'
module.exports = mongoose.models[name] || mongoose.model(name, schema)