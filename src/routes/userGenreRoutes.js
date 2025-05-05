const express = require('express');
const router = express.Router();
const controller = require('../controllers/userGenreController');

router.post('/user-genres', controller.addUserGenres);
router.delete('/user-genres/:user_id/:genre_id', controller.removeUserGenre);
router.get('/user-genres/:user_id', controller.getUserGenres);

module.exports = router;
