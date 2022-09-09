const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
   userId: String,
   item: String,
   itemId: String,
   listingPrice: Number,
   itemsOnSale: Number,
   itemsFilled: Number,
   itemsClaimable: {
      type: Number,
      default: 0
   },
   filled: {
      type: Boolean,
      default: false
   },
   type: String
}, {
   timestamps: true
})

const name = 'market'
module.exports = mongoose.models[name] || mongoose.model(name, schema)