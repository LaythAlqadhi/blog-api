const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

const {
    authenticate,
    authenticateWithoutUnauthorizedError
} = require('../authenticate');
const User = require('../models/user');

exports.users_get = [
  authenticate,
  
  asyncHandler(async (req, res, next) => {
    const users = await User.find().sort({ full_name: 1 }).exec();

    if (!users.length > 0) {
      return res.sendStatus(404);
    }

    res.status(200).json(users);
  })
];

exports.user_get = [
  authenticate,
  asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.params.userId).exec();

    if (!user) {
      return res.sendStatus(404);
    }

    res.status(200).json(user);
  })
];

exports.user_post = [
  body('first_name', 'First Name must not be empty.')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First Name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('First Name must not be greater than 25 characters.')
    .escape(),

  body('last_name', 'Last Name must not be empty.')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last Name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Last Name must not be greater than 25 characters.')
    .escape(),

  body('username', 'Username must not be empty.')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Username must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Username must not be greater than 25 characters.')
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error('Username already in use.');
      }
    }),

  body('email', 'Email must not be empty.')
    .trim()
    .isEmail()
    .withMessage('Email does not match.')
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('Email already in use.');
      }
    }),

  body('password', 'Password must not be empty.')
    .isStrongPassword()
    .withMessage('Password is not strong enough.')
    .escape(),

  body('password_confirmation', 'Password Confirmation must not be empty.')
    .escape()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('Password does not match.'),

  asyncHandler(async (req, res, next) => {
    const result = validationResult(req);

    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      membership_status: 'Member'
    });

    if (!result.isEmpty()) {
      res.json({ errors: result.array() });
      return;
    } else {
      await user.save();
      res.status(200).json(user);
    }
  })
];

exports.user_put = [
  authenticate,
  
  (req, res, next) => {
    if (req.user.id !== req.params.userId) {
      return res.sendStatus(403);
    }
    next();
  },
  
  body('first_name', 'First Name must not be empty.')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First Name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('First Name must not be greater than 25 characters.')
    .escape(),

  body('last_name', 'Last Name must not be empty.')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last Name must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Last Name must not be greater than 25 characters.')
    .escape(),

  body('username', 'Username must not be empty.')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Username must not be less than 2 characters.')
    .isLength({ max: 25 })
    .withMessage('Username must not be greater than 25 characters.')
    .escape()
    .custom(async (value, { req }) => {
      if (value === req.user.username) {
        return;
      }
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error('Username already in use.');
      }
    }),

  body('email', 'Email must not be empty.')
    .trim()
    .isEmail()
    .withMessage('Email does not match.')
    .escape()
    .custom(async (value, { req }) => {
      if (value === req.user.email) {
          return;
      }
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('Email already in use.');
      }
    }),

  body('password', 'Password must not be empty.')
    .isStrongPassword()
    .withMessage('Password is not strong enough.')
    .escape(),

  body('password_confirmation', 'Password Confirmation must not be empty.')
    .escape()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('Password does not match.'),

  asyncHandler(async (req, res, next) => {
    const result = validationResult(req);

    const user = new User({
      _id: req.body.userId,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      membership_status: 'Member'
    });

    if (!result.isEmpty()) {
      res.json({
        errors: result.array()
      });
      return;
    } else {
      await User.findByIdAndUpdate(req.user.id, user, {});
      res.status(200).json(user);
    }
  })
];

exports.user_delete = [
  authenticate,

  (req, res, next) => {
    if (req.user.id !== req.params.userId || !req.isAdmin) {
      return res.sendStatus(403);
    }
    next();
  },

  asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.user.id);
    res.sendStatus(200);
  })
];