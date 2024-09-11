const mongoose = require('mongoose');


const requestSchema = new mongoose.Schema({
    requestId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending'},
    inputFilePath: { type: String, required: true },
    outputFilePath: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);