const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; // Use environment port for deployment

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Files from Vite Build
app.use(express.static(path.join(__dirname, 'dist')));

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://madhantamilarasan80_db_user:yMpdsIAgONYpUBkh@cluster0.q6clxd0.mongodb.net/BETHESDA?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Schema
const reviewSchema = new mongoose.Schema({
    name: { type: String, default: 'Anonymous' },
    rating: { type: Number, required: true },
    category: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Review = mongoose.model('reviews', reviewSchema);

// Routes

// GET all reviews
app.get('/api/reviews', async (req, res) => {
    try {
        // Fetch reviews, sort by newest first
        const reviews = await Review.find().sort({ date: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new review
app.post('/api/reviews', async (req, res) => {
    try {
        const { name, rating, category, text } = req.body;
        
        const newReview = new Review({
            name: name || 'Anonymous',
            rating,
            category,
            text
        });

        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Catch-all route to serve index.html for non-API requests
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});