const express = require('express');
morgan= require('morgan');
fs =require('fs');
path = require('path');
const app = express();
//const accessLogStream = fs.createWriteStream(path.join(_dirname, 'log.txt'), {flags: 'a'});

app.use(morgan('common'));
//app.use(morgan ('combined', {stream:accessLogStream}));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });


app.get('/movies', (req, res) => {
    res.json(topTenMovies);
});

app.get('/', (req, res) => {
    res.send('Let me get you started');
});

app.get('/documentation', express.static('public'));


//app.listen(8080, () => {
    //console.log('Your app is listening on port 8080.');
//});