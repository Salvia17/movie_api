const express = require('express'),
  morgan = require('morgan');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(morgan('common'));

app.use(express.static('public'));

let topTenMovies = [
  {
    title: 'The Godfather',
    cast: 'Marlon Brando, Al Pacino, James Caan, Robert Duvall, Diane Keaton, Talia Shire'
  },
  {
    title: 'The Wizard of Oz',
    cast: 'Judy Garland, Frank Morgan, Ray Bolger, Bert Lahr, Jack Haley'
  },
  {
    title: 'Citizen Kane',
    cast: 'Orson Welles, Joseph Cotten, Dorothy Comingore, Agnes Moorehead, Ruth Warrick'
  },
  {
    title: 'The Shawshank Redemption',
    cast: 'Tim Robbins, Morgan Freeman'
  },
  {
    title: 'Pulp Fiction',
    cast: 'John Travolta, Uma Thurman, Samuel L. Jackson, Bruce Willis, Ving Rhames'
  },
  {
    title: 'Casablanca',
    cast: 'Humphrey Bogart, Ingrid Bergman'
  },
  {
    title: 'The Godfather: Part II',
    cast: 'Al Pacino, Robert De Niro, Robert Duvall, Diane Keaton'
  },
  {
    title: 'E.T. The Extra-Terrestrial',
    cast: 'Henry Thomas, Drew Barrymore, Dee Wallace'
  },
  {
    title: '2001: A Space Odyssey',
    cast: 'Keir Dullea, Gary Lockwood, William Sylvester'
  },
  {
    title: "Schindler's List",
    cast: 'Liam Neeson, Ralph Fiennes, Ben Kingsley'
  },
];

app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

//Return a list of ALL movies
app.get('/movies', (req, res) => {
  res.send('Successful GET request returning data on all the movies');
});

//Return data about a single movie by title
app.get('/movies/:title', (req, res) => {
  res.send('Successful GET request returning data on movie: ' + req.params.title);
});

//Return data about a genre (description)
app.get('/movies/genres/:genre', (req, res) => {
  res.send('Successful GET request returning data on movie genre: ' + req.params.genre);
});

//Return data about a director
app.get('/movies/directors/:name', (req, res) => {
  res.send('Successful GET request returning data on director: ' + req.params.name);
});

//POST request to allow new users to register
app.post('/users', (req, res) => {
  res.send('Successful POST request registering new user');
});

//Allow users to update their user info (username)
app.put('/users/:username', (req, res) => {
  res.send('Successful PUT request updating information for user: ' + req.params.username);
});

//Allow users to add a movie to their list of favorites
app.post('/users/:username/favourites/:title', (req, res) => {
  res.send('Successful POST request adding movie: '
  + req.params.title + ' to list the of ' + req.params.username + ' favourites');
});

//Allow users to remove a movie from their list of favorites
app.delete('/users/:username/favourites/:title', (req, res) => {
  res.send('Successful DELETE request removing movie: '
  + req.params.title + ' from list of ' + req.params.username + ' favourites');
});

//Allow existing users to deregister 
app.delete('/users/:username', (req, res) => {
  res.send('Successful DELETE request removing user: ' + req.params.username + ' from database');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh Oh! Something went wrong!');
});

app.listen(8080, () =>
  console.log('Your app is listening on port 8080.'));
