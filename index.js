const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/[myflixdb]', { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express');
const morgan= require('morgan');
const fs =require('fs');
const path = require('path');
const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
const uuid = require('uuid');

app.use(express.json());
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
app.use(morgan('common'));
app.use(morgan ('combined', {stream:accessLogStream}));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
app.use("/documentation", express.static("public"));





  
  


app.get('/', (req, res) => {
    res.send('Let me get you started');
});

app.get("/documentation", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "documentation.html"));
});



//express code for api endpoints 
//Return a list of ALL movies to the user; //works
app.get('/movies', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

//works
//Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;
app.get('/movies/:title', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });


//Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get('/movies/genre/:name', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const genreName= req.params.name;
    const movie = await Movies.findOne({ 'Genre.Name': genreName})
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });


//Return data about a director (bio, birth year, death year) by name;
app.get('/movies/directors/:director', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const director = req.params.director;
    const movie = await Movies.findOne({ 'Director.Name': director})
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });


//Allow new users to register; 
//works
app.post('/users', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });


//Allow users to update their user info (username); 
//works
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }) 
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: '+ err);
    })
  
  });

//works
//Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later);
app.post('/users/:Username/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
       $push: { FavoriteMovies: req.params.MovieID }
     },
     { new: true }) 
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });


//works
//Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed—more on this later);
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
       $pull: { FavoriteMovies: req.params.MovieID }
     },
     { new: true }) 
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

//works
//Allow existing users to deregister (showing only a text that a user email has been removed—more on this later).
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });


app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});