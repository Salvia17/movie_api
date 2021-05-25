const jwtSecret = 'your_jwt_secret'; //this mus be the same key used in JWTSrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); //My local passport file

/**
 * Function that generates authentication token with expiration and algorithm settings
 * @param {string} user
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, //This is the username being encoded in the JWT
    expiresIn: '7d', //Token will expirein 7 days
    algorithm: 'HS256' //This is the algorithm used to “sign” or encode the values of the JWT
  });
}

/** 
 * POST login.
 * API call to login endpoint. This will authenticate user and generate a JWT token
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
