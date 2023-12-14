const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

const {
    authenticate,
    authenticateWithoutUnauthorizedError
} = require('../authenticate');

const Comment = require('../models/comment');

exports.comments_get = [
  asyncHandler(async (req, res, next) => {
    const comments = await Comment.find({ post: req.params.postId }).populate('user').exec();

    if (!comments.length > 0) {
      return res.sendStatus(404);
    }

    res.status(200).json(comments);
  })
];

exports.comment_post = [
  authenticate,

  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment must not be empty.')
    .isLength({ max: 2500 })
    .withMessage('Comment must not be greater than 2500 characters.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const result = validationResult(req);

    const comment = new Comment({
      text: req.body.text,
      post: req.params.postId,
      user: req.user.id
    });

    if (!result.isEmpty()) {
      res.json({ errors: result.array() });
      return;
    } else {
      await comment.save();
      await comment.populate('user');
      res.status(200).json(comment);
    }
  })
];

exports.comment_put = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.body.commentId)
      .populate('user')
      .exec();

    if (req.user.id !== comment.user.id) {
      return res.sendStatus(403);
    }

    next();
  }),

  body('text')
  .trim()
  .notEmpty()
  .withMessage('Comment must not be empty.')
  .isLength({ max: 2500 })
  .withMessage('Comment must not be greater than 2500 characters.')
  .escape(),

  asyncHandler(async (req, res, next) => {
    const result = validationResult(req);

    const comment = new Comment({
      _id: req.body.commentId,
      text: req.body.text,
      post: req.body.postId,
      user: req.user.id
    });

    if (!result.isEmpty()) {
      res.json({
        errors: result.array()
      });
      return;
    } else {
      await Comment.findByIdAndUpdate(req.body.commentId, comment, {});
      await comment.populate('user');
      res.status(200).json(comment);
    }
  })
];

exports.comment_delete = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.commentId)
      .populate('user')
      .exec();

    if (req.user.id !== comment.user.id && !req.isAdmin) {
      return res.sendStatus(403);
    }
    
    await Comment.findByIdAndDelete(req.params.commentId);
    res.sendStatus(200);
  })
];