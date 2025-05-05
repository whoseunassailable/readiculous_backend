


const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookGenreController');

router.post('/book-genres', controller.assignGenresToBook);

module.exports = router;
