const express = require('express');
morgan= require('morgan');
fs =require('fs');
path = require('path');
const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(morgan('common'));
app.use(morgan ('combined', {stream:accessLogStream}));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
app.use("/documentation", express.static("public"));

let users = [
    {
      id:'1',
      fullname: 'John Doe',
      email: 'johndoe@mail.com',
      favMovies: [{
        title: 'Inception',
        director: 'Christopher Nolan',
        genre: 'Sci-Fi'
      }]
    },
    {
      id:'2',
      fullname: 'Jane Doe',
      email: 'janedoe@mail.com',
      favMovies: [{
        title: 'Inception',
        director: 'Christopher Nolan',
        genre: 'Sci-Fi'
      }]
    }
  
  ];

let movies = [
    {
      title: 'Inception',
      director: 'Christopher Nolan',
      genre: 'Sci-Fi'
    },
    {
      title: 'Lord of the Rings',
      director: 'Peter Jackson',
      genre: 'Fantasy'
    },
    {
      title: 'The Matrix',
      director: 'Lana Wachowski',
      genre: 'Sci-fi'
    },
    {
        title: 'The Avengers',
        director: 'Anthony Russo',
        genre: 'Super-Heroes'
      },
      {
        title: 'The Silence Of The Lambs',
        director: 'Jonathan Demme',
        genre: 'Suspense-Thriller'
      },
      {
        title: 'Terminator',
        director: 'James Cameron',
        genre: 'Action'
      },
  ];
  
  let directors = [
    {
        name: 'Peter Jackson',
        bio: 'I love peas......',
        birth: '....'
    },
    {
        name: 'Anthony Russo',
        bio: '...',
        birth: '...'
    },
    {
        name: 'James Cameron', 
        bio: '....', 
        birth: '....'
    },
  ];


app.get('/', (req, res) => {
    res.send('Let me get you started');
});

app.get("/documentation", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "documentation.html"));
});





//express code for api endpoints 
//Return a list of ALL movies to the user;
app.get('/movies', (req, res) => {
    res.json(movies);
})
//Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;
app.get ('/movies/:title', (req, res) => {
    let {title} = req.params;
    let movie = movies.find(movie => movie.title === title)
    res.json(movie);
})
//Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get ('/movies/:title/genre', (req, res) => {
    let {title} = req.params;
    let movie = movies.find(movie => movie.title === title)
    res.json(movie.genre);
})
//Return data about a director (bio, birth year, death year) by name;
app.get ('/directors/:name', (req, res) => {
    let {name} = req.params;
    let  director = directors.find( director=> director.name === name)
    res.json(director);
})
//Allow new users to register;
app.post ('/users', (req, res) => {
    let newUser = req.body;
    let user = {
        id: uuid.v4(),
        fullname: newUser,
    }
    users.push(newUser);
    res.send("New User added.")
})
//Allow users to update their user info (username);
app.put ('/users/:id', (req, res) => {
    let {id} = req.params;
    let updatedUser = req.body;
    let user = users.find (user => user.id == id);

    if (user) {
        user = {
            user: user.id,
            fullname: updatedUser,
            email: user.email,
            favMovies: user.favMovies
        };
    }
    else {
        res.send ("Sorry. Can't find you.")
    }
})
//Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later);
app.post ('/users/:id/:title', (req, res) => {
    let {id, title} = req.params;
    let user = users.find(user => user.id === id)
    let newTitle = { 
        title: title,
        director: req.body.director,
        genre: req.body.genre
    }; 
    if(user){
        user.favMovies.push(newTitle);
        res.send("Movies updated")
    }
    else{
        res.send("can't find you")
    }
})
//Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed—more on this later);
app.delete ('/users/:id/:title', (req, res) => {
    let {id, title} = req.params;
    let user = users.find (user => user.id === id); 
    if (user){
        delete user.favMovies.title;
    }
    else {
        res.send("sorry, can't find you")
    }

})
//Allow existing users to deregister (showing only a text that a user email has been removed—more on this later).
app.delete ('/users/:id', (req, res) => {
    let {id} = req.params;
    let user = users.find( user => user.id === id);
    if (user){
        delete user;
        res.send("Your account is deleted!")
    }
})


app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});