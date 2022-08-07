const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   creatorId: String,
   code: String,
   plan: String,
   type: String
}, {
   timestamps: false
})

const name = 'premium code'
module.exports = mongoose.models[name] || mongoose.model(name, schema)