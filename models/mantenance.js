const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const maintenanceSchema = new mongoose.Schema({
    maintenance: Boolean,
    maintenanceReason: String
})

const name = 'maintenance'
module.exports = mongoose.models[name] || mongoose.model(name, maintenanceSchema, name)