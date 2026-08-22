const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    contentId: String,          // YouTube Video ID ya Instagram Reel ID
    title: String,              // Video title ya caption
    thumbnailUrl: String,       // Thumbnail image link
    platform: { type: String, enum: ['youtube', 'instagram'] },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    submissionDate: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' }, 
    contents: [contentSchema] // Har client ki apni submitted videos/reels
});

module.exports = mongoose.model('User', userSchema);