const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/users/create', userController.createUser);
router.post('/users/login', userController.loginUser);
router.delete('/users/:user_id', userController.deleteUser);
router.get('/users',userController.getAllUsers);
router.get('/users/preferences', userController.getUserPreferences);

module.exports = router;
