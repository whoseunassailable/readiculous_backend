const db = require('../config/db');

// Add genres to a user's preferences
exports.addUserGenres = async (req, res) => {
    const { user_id, genre_ids } = req.body;

    if (!user_id || !Array.isArray(genre_ids) || genre_ids.length === 0) {
        return res.status(400).json({ message: 'user_id and genre_ids array are required' });
    }

    try {
        const values = genre_ids.map(genre_id => [user_id, genre_id]);
        await db.query('INSERT IGNORE INTO user_genres (user_id, genre_id) VALUES ?', [values]);

        res.status(201).json({ message: 'Genres added to user preferences' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove a genre from a user's preferences
exports.removeUserGenre = async (req, res) => {
    const { user_id, genre_id } = req.params;

    try {
        const [result] = await db.execute(
            'DELETE FROM user_genres WHERE user_id = ? AND genre_id = ?',
            [user_id, genre_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Preference not found' });
        }

        res.json({ message: 'Genre preference removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all genres preferred by a user
exports.getUserGenres = async (req, res) => {
    const { user_id } = req.params;

    try {
        const [rows] = await db.execute(
            `SELECT g.genre_id, g.name
             FROM user_genres ug
             JOIN genres g ON ug.genre_id = g.genre_id
             WHERE ug.user_id = ?`,
            [user_id]
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
