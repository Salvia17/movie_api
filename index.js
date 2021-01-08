const express = require('express'),
  morgan = require('morgan');

const app = express();

app.use(morgan('common'));

app.use(express.static('public'));

app.get('/movies', (_req, res) => {
  res.json(topTenMovies);
});

app.get('/', (_req, res) => {
  res.send('Welcome to myFlix!');
});

app.listen(8080, () =>
  console.log('Your app is listening on port 8080.'));
