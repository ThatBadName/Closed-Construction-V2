const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   userId: String,
   item: String,
   itemId: String,
   emoji: String,
   amount: Number,
   data: []
}, {
   timestamps: false
})

const name = 'inventory'
module.exports = mongoose.models[name] || mongoose.model(name, schema)