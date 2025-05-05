const db = require('../config/db');

// Assign genres to a book
exports.assignGenresToBook = async (req, res) => {
    const { book_id, genre_ids } = req.body;

    if (!book_id || !Array.isArray(genre_ids) || genre_ids.length === 0) {
        return res.status(400).json({ message: 'book_id and genre_ids array are required' });
    }

    try {
        const values = genre_ids.map(genre_id => [book_id, genre_id]);

        await db.query(
            'INSERT IGNORE INTO book_genres (book_id, genre_id) VALUES ?',
            [values]
        );

        res.status(201).json({ message: 'Genres assigned to book' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};