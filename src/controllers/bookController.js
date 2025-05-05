const db = require('../config/db');

// Get all books
exports.getBooks = async (req, res) => {
    try {
        const [books] = await db.execute('SELECT * FROM books');
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new book
exports.createBook = async (req, res) => {
    const { title, author, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO books (title, author, description) VALUES (?, ?, ?)',
            [title, author, description]
        );

        res.status(201).json({ message: 'Book created', book_id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update book
exports.updateBook = async (req, res) => {
    const { book_id } = req.params;
    const { title, author, description } = req.body;

    try {
        const [result] = await db.execute(
            'UPDATE books SET title = ?, author = ?, description = ? WHERE book_id = ?',
            [title, author, description, book_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
