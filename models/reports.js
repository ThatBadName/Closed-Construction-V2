const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
   reporterId: String,
   suspectId: String,
   reason: String,
   proofUrl: String,
   reportId: String,
   messageUrl: String,
   status: {type: String, default: 'Processing'},
   type: String
}, {
   timestamps: true
})

const name = 'report'
module.exports = mongoose.models[name] || mongoose.model(name, schema)