const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
   userId: String,
   failed: {
    type: Number,
    default: 0,
   },
   hasWarned: {
    type: Boolean,
    default: false
   },
   message: String,
   code: String,
}, {
   timestamps: false
})

const name = 'verification'
module.exports = mongoose.models[name] || mongoose.model(name, schema)