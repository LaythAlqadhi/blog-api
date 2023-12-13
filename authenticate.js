const passport = require('passport');

const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.membership_status === 'Admin') {
      req.isAdmin = true;
    } else {
      req.isAdmin = false;
    }

    req.user = user;
    next();
  })(req, res, next);
};

const authenticateWithoutUnauthorizedError = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!user) {
      return next();
    }

    if (user.membership_status === 'Admin') {
      req.isAdmin = true;
    } else {
      req.isAdmin = false;
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = {
  authenticate,
  authenticateWithoutUnauthorizedError
};