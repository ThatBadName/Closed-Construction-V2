const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
   boxId: String,
   coins: Number,
   item1Id: String,
   item2Id: String,
   item3Id: String,
   item4Id: String,
   item5Id: String,
   item1Amount: Number,
   item2Amount: Number,
   item3Amount: Number,
   item4Amount: Number,
   item5Amount: Number,
}, {
   timestamps: false
})

const name = 'giftbox'
module.exports = mongoose.models[name] || mongoose.model(name, schema)