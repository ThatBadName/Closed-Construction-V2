const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
   userId: String,
   strike: {
    type: Number,
    default: 0
   },
   expires: Date
}, {
   timestamps: false
})

const name = 'failedVerification'
module.exports = mongoose.models[name] || mongoose.model(name, schema)