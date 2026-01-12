const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});