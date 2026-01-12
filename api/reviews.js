const mongoose = require('mongoose');

// 1. Connection Caching
// Vercel functions are stateless, but containers are reused. 
// We cache the connection to avoid connecting on every single request.
let cachedDb = null;

const MONGO_URI = 'mongodb+srv://madhantamilarasan80_db_user:yMpdsIAgONYpUBkh@cluster0.q6clxd0.mongodb.net/BETHESDA?retryWrites=true&w=majority&appName=Cluster0';

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    // Prepare connection options
    const opts = {
        bufferCommands: false, // Disable Mongoose buffering
    };

    console.log('Connecting to MongoDB...');
    const db = await mongoose.connect(MONGO_URI, opts);
    cachedDb = db;
    console.log('MongoDB Connected');
    return db;
}

// 2. Define Schema (Same as server.js)
const reviewSchema = new mongoose.Schema({
    name: { type: String, default: 'Anonymous' },
    rating: { type: Number, required: true },
    category: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

// Prevent model recompilation error in serverless environment
const Review = mongoose.models.reviews || mongoose.model('reviews', reviewSchema);

// 3. Main Handler Function
module.exports = async (req, res) => {
    // Enable CORS for everyone (or restrict to your domain)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle Preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            // Fetch reviews
            const reviews = await Review.find().sort({ date: -1 });
            return res.status(200).json(reviews);
        } 
        
        else if (req.method === 'POST') {
            // Save review
            const { name, rating, category, text } = req.body;
            
            const newReview = new Review({
                name: name || 'Anonymous',
                rating,
                category,
                text
            });

            const savedReview = await newReview.save();
            return res.status(201).json(savedReview);
        } 
        
        else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};