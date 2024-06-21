const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan'),
  passport = require('passport'),
  mongoose = require('mongoose'),
  cors = require('cors'),
  { check, validationResult } = require('express-validator');
require('./passport');

const app = express();
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
// const Genres = Models.Genre;
// const Directors = Models.Director;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', {
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

let auth = require('./auth')(app);

//------------------------------------------------------------------------------

/** 
 * Return landing/ welcome message
 * 
 * @method GET
 * @param {string} enpdpoint - "url/"
 * @returns {object} - welcome page
 */
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!')
});

/** 
 * Return list of all  movies
 * <br>
 * Protected route
 * @method GET
 * @param {string} enpdpoint - "url/movies"
 * @returns {object} - movie as object
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * Return data about single movie, by title
 * <br>
 * Protected route
 * @method GET
 * @param {string} enpdpoint - "url/movies/:Title"
 * @param {string} Movie Title
 * @returns {object} - movie details as object
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * Return data about genre, by genre name
 * <br>
 * Protected route
 * @method GET
 * @param {string} enpdpoint - "url/Genre/:Name"
 * @param {string} Genre Name
 * @returns {object} - genre details as object
 */
app.get('/Genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movies) => {
      res.json(movies.Genre.Name + ': ' + movies.Genre.Description + ', ' + movies.Genre.Movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * Return list of movies, by genre name
 * <br>
 * Protected route
 * @method GET
 * @param {string} enpdpoint - "url/movies/Genre/:Name"
 * @param {string} Genre Name
 * @returns {object} - movies with specific genre, as object
 */
app.get('/movies/Genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ 'Genre.Name': req.params.Name })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * Return data about director, by director name
 * <br>
 * Protected route
 * @method GET
 * @param {string} enpdpoint - "url/Director/:Name"
 * @param {string} Director Name
 * @returns {object} - director details as object
 */
app.get("/Director/:Name", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movies) => {
      res.json(movies.Director.Name + ': ' + movies.Director.Bio);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/** 
 * Return list of movies, by director name
 * <br>
 * Protected route
 * @method GET
 * @param {string} enpdpoint - "url/movies/Director/:Name"
 * @param {string} Director Name
 * @returns {object} - movies with specific director, as object
 */
app.get('/movies/Director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ 'Director.Name': req.params.Name })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * Allow new users to register
 * <br>
 * Protected route
 * @method POST
 * @param {string} enpdpoint - "url/users"
 * @param {string} Username
 * @param {string} Password
 * @param {string} Email
 * @param {date} Birthday
 * @returns {object} - creates new user
 */

/** Expected JSON structure: 
* {
*  ID: Integer,
*  Username: String,
*  Password: String,
*  Email: String,
*  Birthday: Date
* }
*/
app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

/** 
 * Allow users to view their own user profile
 * <br>
 * Protected route
 * @method GET
 * @param {string} enpdpoint - "url/users/:Username"
 * @param {string} Username
 * @returns {object} - user details as object
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/** 
 * Allow users to update their user data
 * <br>
 * Protected route
 * @method PUT
 * @param {string} enpdpoint - "url/users/:Username"
 * @param {string} Username
 * @returns {string} - success/error message
 */
/** Expected JSON structure: 
* {
*  ID: Integer,
*  Username: String,
*  Password: String,
*  Email: String,
*  Birthday: Date
* }
*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

/** 
 * Allow users to add a movie to their list of favorites
 * <br>
 * Protected route
 * @method POST
 * @param {string} enpdpoint - "url/users/:Username/Movies/:MovieID"
 * @param {string} Username
 * @param {number} MovieId
 * @returns {string} - success/error message
 */
app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

/** 
 * Allow users to remove a movie to their list of favorites
 * <br>
 * Protected route
 * @method DELETE
 * @param {string} enpdpoint - "url/users/:Username/Movies/:MovieID"
 * @param {string} Username
 * @param {number} MovieID
 * @returns {string} - success/error message
 */
app.delete('/users/:Username/Movies/:MovieID', passport.authenticate('jwt',
  { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },

      {
        $pull: { FavoriteMovies: req.params.MovieID },
      }, {
      new: true
    },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error ' + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  });

/** 
 * Allow users to deregister
 * <br>
 * Protected route
 * @method DELETE
 * @param {string} enpdpoint - "url/users/:Username"
 * @param {string} Username
 * @returns {string} - success/error message
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found.');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//------------------------------------------------------------------------------

// Return error for requests that cannot be completed
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send('Something broke!');
});

// Log port in console
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});











