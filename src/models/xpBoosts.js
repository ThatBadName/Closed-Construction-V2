const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
     userId: String,
     increase: Number,
     expires: Date
}, {
   timestamps: false
})

const name = 'xpBoost'
module.exports = mongoose.models[name] || mongoose.model(name, schema)