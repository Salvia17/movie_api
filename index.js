const
  express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  uuid = require('uuid');

const { check, validationResult } = require('express-validator');

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
//Had to use useFindAndModify: false, as per Mongoose documentation, due to Deprecation Warning
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const app = express();

app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const cors = require('cors');
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*',
    "http://localhost:4200");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});


//Return a list of ALL movies
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

//Return a list of ALL users
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Return data about a single movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Return data about a genre by name (description)
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      res.status(201).json(movie.Genre.Name + '. ' + movie.Genre.Description);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//Return data about a director by name
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      res.status(201).json(movie.Director.Name + '. ' + movie.Director.Bio);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//POST request to allow new users to register
app.post('/users', [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username }) //<--- this first searches if the user by entered username exists
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists'); //<--- if it does, it returns an error with a message
      } else { //<--- if it doesn't, this creates a new user
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
          .then((user) => {
            res.status(201).json(user)
          })
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

//Allow users to update their user info (by username)
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

    //Checks if the user taking action is the same user, that's logged in.
    if (req.user.Username !== req.params.Username) {
      return res.status(403).json({
        error: { message: 'You can only update your own user.' },
      })
    };

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
  });

//Allow users to add a movie to their list of favorites
app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {

  //Checks if the user taking action is the same user, that's logged in.
  if (req.user.Username !== req.params.Username) {
    return res.status(403).json({
      error: { message: 'You can only update your own user.' },
    })
  };

  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavouriteMovies: req.params.MovieID }
  },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

//Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {

  //Checks if the user taking action is the same user, that's logged in.
  if (req.user.Username !== req.params.Username) {
    return res.status(403).json({
      error: { message: 'You can only update your own user.' },
    })
  };

  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavouriteMovies: req.params.MovieID }
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

//Allow existing users to deregister 
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {

  //Checks if the user taking action is the same user, that's logged in.
  if (req.user.Username !== req.params.Username) {
    return res.status(403).json({
      error: { message: 'You can only delete your own user.' },
    })
  };

  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
    )
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh Oh! Something went wrong!');
});

/*app.use((err, req, res, next) => {
  res.setHeader('Acces-Control-Allow-Origin','*');
  res.setHeader('Acces-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Acces-Contorl-Allow-Methods','Content-Type','Authorization');
  next();
  console.error(err.stack);
  res.status(500).send('Uh Oh! Something went wrong!');
});*/

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
