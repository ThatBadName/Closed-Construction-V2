const mongoose = require('mongoose')
const {
   Schema
} = mongoose

const schema = new Schema({
   userId: {
      type: String,
      unique: true
   },
   developer: {
      type: Boolean,
      default: false
   },
   dmNotifs: {
      type: Boolean,
      default: true
   },
   texting: {
      type: Boolean,
      default: true
   },
   badges: [{
      _id: String,
   }],
   bio: {
      type: String,
      default: 'This user has no bio'
   },
   wallet: {
      type: Number,
      default: 0
   },
   bank: {
      type: Number,
      default: 0
   },
   maxBank: {
      type: Number,
      default: 2000
   },
   level: {
      type: Number,
      default: 0
   },
   xp: {
      type: Number,
      default: 0
   },
   requiredXp: {
      type: Number,
      default: 100
   },
   coinMulti: {
      type: Number,
      default: 0
   },
   devMode: {
      type: Boolean,
      default: false
   }

}, {
   timestamps: true
})

const name = 'user'
module.exports = mongoose.models[name] || mongoose.model(name, schema)