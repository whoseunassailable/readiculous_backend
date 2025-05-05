const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/books', bookController.getBooks);
router.post('/books', bookController.createBook);
router.put('/books/:book_id', bookController.updateBook);

module.exports = router;
