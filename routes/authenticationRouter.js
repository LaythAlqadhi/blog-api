const express = require('express');
const router = express.Router();
const authentication_controller = require('../controllers/authenticationController');

router.post('/login', authentication_controller.login_post);

module.exports = router;