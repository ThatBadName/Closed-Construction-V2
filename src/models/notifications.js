const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   userId: String,
   notification: String,
   Id: String,
}, {
   timestamps: true
})

const name = 'Notification'
module.exports = mongoose.models[name] || mongoose.model(name, schema)