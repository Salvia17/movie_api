const express = require('express');

const app = express();

app.get('/movies', (req, res) => {
  res.json(topTenMovies);
});

app.get('/', (req, res) =>{
  res.send('Welcome to myFlix!');
});

app.listen(8080, () =>
  console.log('Your app is listening on port 8080.'));
