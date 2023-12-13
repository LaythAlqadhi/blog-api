const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  full_name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  membership_status: {
    type: String,
    enum: ['Admin', 'Member'],
    default: 'Member'
  }
});

UserSchema.pre('save', async function (next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.pre('save', function(next) {
  const user = this;
  user.full_name = `${user.first_name} ${user.last_name}`;
  next();
});

module.exports = mongoose.model('User', UserSchema);