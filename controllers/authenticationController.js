const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

const User = require('../models/user');

exports.login_post = [
  body('username').notEmpty().trim().escape(),
  body('password').notEmpty().trim().escape(),

  asyncHandler(async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(403).json({ message: 'Incorrect username' });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(403).json({ message: 'Incorrect password' });
    }

    // User found, create and sign a JWT
    const payload = { sub: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Send the JWT as a response
    return res.json({ token });
  })
];