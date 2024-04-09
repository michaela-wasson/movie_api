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


app.get('/movies', (req, res) => {
    //const topTenMovies = {"one" : [15, 4.5],
        //"two" : [34, 3.3],
        //"three" : [67, 5.0],
        //"four" : [32, 4.1]};
    //var topTenMovies = JSON.stringify(dict);
    //fs.writeFile("toptenmovies.json", topTenMovies);
    //I'm guessing the previous code isn't supposed to go here
    res.json(topTenMovies);
});

app.get('/', (req, res) => {
    res.send('Let me get you started');
});

app.get("/documentation", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "documentation.html"));
});



app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});




