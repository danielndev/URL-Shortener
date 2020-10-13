const mongoose = require('mongoose');

const ShortURLSchema = new mongoose.Schema({
    originalLink: String,
    shortLink: String
});

module.exports = mongoose.model('ShortURLs', ShortURLSchema);