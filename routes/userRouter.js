const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');

router.get('/users', user_controller.users_get);
router.get('/users/:userId', user_controller.user_get);
router.post('/users', user_controller.user_post);
router.put('/users/:userId', user_controller.user_put);
router.delete('/users/:userId', user_controller.user_delete);

module.exports = router;