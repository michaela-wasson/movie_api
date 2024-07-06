const jwtSecret = 'your_jwt_secret';

const jwt= require('jsonwebtoken'), 
passport = require ('passport');

require('./passport'); 


let generateJWTToken = (user) => {
    return jwt.sign(user,jwtSecret, {
        subject: user.Username,
        expiresIn: '7d', 
        algorithm: 'HS256'
    });
}



module.exports = (router) => {
    router.post('/login', (req, res) => {
      console.log(res);
      passport.authenticate('local', { session: false }, (error, user, info) => {
        if (error || !user) {
          return res.status(400).json({
            message: 'Something is not right',
            user: user
          });
          console.log(res);
        }
        req.login(user, { session: false }, (error) => {
          if (error) {
            res.send(error);
            console.log(req);
          }
          let token = generateJWTToken(user.toJSON());
          return res.json({ user, token });
        });
        console.log(res);
      })(req, res);
    });
  }

