const express = require('express');
const router = express.Router();

const post_controller = require('../controllers/postController');

router.get('/posts', post_controller.posts_get);
router.get('/posts/:postId', post_controller.post_get);
router.post('/posts', post_controller.post_post);
router.put('/posts/:postId', post_controller.post_put);
router.delete('/posts/:postId', post_controller.post_delete);

module.exports = router;