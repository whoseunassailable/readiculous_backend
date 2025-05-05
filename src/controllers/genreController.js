const db = require('../config/db');


// Get All Genres
exports.getGenres = async (req, res) => {
    try {
        const [genres] = await db.execute('SELECT genre_id, name FROM genres');
        res.json(genres);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

