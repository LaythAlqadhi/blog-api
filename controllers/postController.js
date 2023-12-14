const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

const {
    authenticate,
    authenticateWithoutUnauthorizedError
} = require('../authenticate');
const User = require('../models/user');
const Post = require('../models/post');

exports.posts_get = [
  authenticateWithoutUnauthorizedError,
  
  asyncHandler(async (req, res, next) => {
    let posts;
    
    if (req.isAdmin) {
      posts = await Post.find().sort({ createdAt: 1 }).populate('user').lean().exec();
    } else if (req.user) {
      posts = await Post.find({
        $or: [
          { privacy: 'Public' },
          { user: req.user.id }
        ]
      }).populate('user').sort({ createdAt: 1 }).lean().exec();
    } else {
      posts = await Post.find({
        privacy: 'Public'
      }).populate('user').sort({ createdAt: 1 }).lean().exec();
    }

    if (!posts.length > 0) {
      return res.sendStatus(404);
    }

    posts.forEach(post => {
      if (req.user && req.user.id.toString() === post.user._id.toString()) {
        post.editable = true;
      } else {
        post.editable = false;
      }
    });

    res.status(200).json(posts);
  })
];

exports.post_get = [
  authenticateWithoutUnauthorizedError,

  asyncHandler(async (req, res, next) => {
    let post;

    if (req.isAdmin) {
      post = await Post.findById(req.params.postId).populate('user').exec();
    } else if (req.user) {
      post = await Post.findOne({
        _id: req.params.postId,
        $or: [
          { privacy: 'Public' },
          { user: req.user.id }
        ]
      }).populate('user').exec();
    } else {
      post = await Post.findOne({
        _id: req.params.postId,
        privacy: 'Public'
      }).populate('user').exec();
    }

    if (!post) {
      return res.sendStatus(404);
    }

    res.status(200).json(post);
  })
];

exports.post_post = [
  authenticate,
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title must not be empty.')
    .isLength({ max: 50 })
    .withMessage('Title must not be greater than 50 characters.')
    .escape(),
  body('text', 'Body must not be empty.')
    .trim()
    .notEmpty()
    .withMessage('Title must not be empty.')
    .isLength({ max: 5000 })
    .withMessage('Body must not be greater than 5000 characters.')
    .escape(),
  body('privacy').isIn(['Private', 'Public']).escape(),
  
  asyncHandler(async (req, res, next) => {
    const result = validationResult(req);

    const post = new Post({
      title: req.body.title,
      text: req.body.text,
      privacy: req.body.privacy,
      user: req.user.id
    });

    if (!result.isEmpty()) {
      res.json({ errors: result.array() });
      return;
    } else {
      await post.save()
      await post.populate('user');
      res.status(200).json(post);
    }
  })
];

exports.post_put = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId)
      .populate('user')
      .exec();
    
    if (req.user.id !== post.user.id) {
      return res.sendStatus(403);
    }
    next();
  }),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title must not be empty.')
    .isLength({ max: 50 })
    .withMessage('First Name must not be greater than 50 characters.')
    .escape(),
  body('text', 'Text must not be empty.')
    .trim()
    .notEmpty()
    .withMessage('Title must not be empty.')
    .isLength({ max: 5000 })
    .withMessage('Last Name must not be greater than 5000 characters.')
    .escape(),
  body('privacy').isIn(['Private', 'Public']).escape(),

  asyncHandler(async (req, res, next) => {
    const result = validationResult(req);

    const post = new Post({
      _id: req.body.postId,
      title: req.body.title,
      text: req.body.text,
      privacy: req.body.privacy,
      user: req.user.id
    });

    if (!result.isEmpty()) {
      res.json({
        errors: result.array()
      });
      return;
    } else {
      await Post.findByIdAndUpdate(req.body.postId, post, {});
      await post.populate('user');
      res.status(200).json(post);
    }
  })
];

exports.post_delete = [
  authenticate,

  asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId)
      .populate('user')
      .exec();

    if (req.user.id !== post.user.id && !req.isAdmin) {
      return res.sendStatus(403);
    }
    next();
  }),

  asyncHandler(async (req, res, next) => {
    await Post.findByIdAndDelete(req.body.postId);
    res.sendStatus(200);
  })
];