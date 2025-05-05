const express = require('express');
const app = express();
const cors = require('cors');

// Import route files
const userRoutes = require('./routes/userRoutes.js');
// const genreRoutes = require('./routes/genreRoutes');
// const userGenreRoutes = require('./routes/userGenreRoutes');
// const bookRoutes = require('./routes/bookRoutes');
// const bookGenreRoutes = require('./routes/bookGenreRoutes');
// const ratingRoutes = require('./routes/ratingRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send("Welcome to the Readiculous Book Recommendation API");
});

// Mount routes
// app.use('/api/users', userRoutes);
// app.use('/api/genres', genreRoutes);
// app.use('/api/user-genres', userGenreRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/book-genres', bookGenreRoutes);
// app.use('/api/ratings', ratingRoutes);
app.use('/api', userRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
