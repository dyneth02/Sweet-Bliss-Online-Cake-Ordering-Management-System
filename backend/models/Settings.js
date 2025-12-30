const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    vacationMode: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', SettingsSchema);