const express = require('express');
const router = express.Router();

const comment_controller = require('../controllers/commentController');

router.get('/posts/:postId/comments', comment_controller.comments_get);
router.post('/posts/:postId/comments', comment_controller.comment_post);
router.put('/posts/:postId/comments/:commentId', comment_controller.comment_put);
router.delete('/posts/:postId/comments/:commentId', comment_controller.comment_delete);

module.exports = router;