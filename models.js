const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Defines database schema for all movies
 */
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  ImagePath: String,
  Featured: Boolean
});

/**
 * Defines database schema for all users
 */
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Hashes password. Encrypted password is stored in the database
 * @param {string} password
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Compares hashed password in database with password user entered
 * @param {string} password
 */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

/**
 * Creates models
 */
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

/**
 * Exports models
 */
module.exports.Movie = Movie;
module.exports.User = User;
