const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/moonvalley')
.then(() => console.log("🔥 MongoDB Connected Successfully!"))
.catch(err => console.log("DB Connection Error: ", err));

// ================= LOGIN AUTHENTICATION ROUTE =================
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        if (user.password === password) {
            res.json({ success: true, message: "Login successful!" });
        } else {
            res.json({ success: false, error: "Wrong password" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ================= CLIENT DASHBOARD STATS & CONTENT ROUTE =================
app.get('/api/client-dashboard/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "User nahi mila!" });
        }

        let totalViews = user.contents.reduce((sum, item) => sum + item.views, 0);
        let totalLikes = user.contents.reduce((sum, item) => sum + item.likes, 0);
        let totalSubmissions = user.contents.length;

        res.json({
            success: true,
            username: user.username,
            stats: { totalViews, totalLikes, totalSubmissions },
            contents: user.contents 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ================= ADMIN ADD CONTENT & USER ROUTE =================
app.post('/api/admin/add-content', async (req, res) => {
    try {
        const { username, password, contentId, title, thumbnailUrl, platform, views, likes, status } = req.body;

        if (!username) {
            return res.status(400).json({ error: "Username dalna zaroori hai!" });
        }

        let user = await User.findOne({ username });
        if (!user) {
            user = new User({ 
                username, 
                password: password || "1234", 
                contents: [] 
            });
        } else if (password) {
            user.password = password;
        }

        user.contents.push({
            contentId: contentId || "vid_" + Date.now(),
            title,
            thumbnailUrl,
            platform,
            views: views || 0,
            likes: likes || 0,
            status: status || 'Pending',
            submissionDate: new Date()
        });

        await user.save();
        res.json({ success: true, message: `🎉 Content & Password set successfully for ${username}!` });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));