const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Actors = Models.Actor;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myfavfilmz', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();
app.use(bodyParser.json());

app.use(morgan('common'));

app.use(express.static('public'))

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('We have a problem here....');
})

//GET route that returns a list of ALL movies to the user
app.get('/movies', (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//GET route that returns data about a single movie by title
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET route that returns a movie description
app.get('/movies/:Title/Description', (req, res) => {
//Needs to assign what it finds based on the parameter to the variable "movie"
Movies.findOne({ Title: req.params.Title })
.then((movie) => {
  res.json(movie.Description);
})
.catch((err) => {
  console.error(err);
  res.status(500).send('Error: ' + err);
});
});

//GET route that returns a movie genre
app.get('/movies/:Title/Genre', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET route that returns info about a movie's director
app.get('/movies/:Title/Director', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET route that returns a movie's images
app.get('/movies/:Title/Image', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie.ImagePath);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET route that returns a list of all actors
app.get('/actors', (req, res) => {
  //Find all data within the actors collection.
  Actors.find()
  .then((actors) => {
    res.status(201).json(actors);
  })
  //catch any errors that may occur
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//GET route that returns data about a single movie by title
app.get('/actors/:Name', (req, res) => {
  Actors.findOne({ Name: req.params.Name })
    .then((actors) => {
      res.json(actors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET a list of all users by (note: for tests only; to be commented out and not included among public endpoints)
app.get('/users', (req, res) => {
  Users.find({ Users: req.params.Users })
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//POST route that allows new users to register
app.post('/users', (req, res) => {
  //check to see if user with that username already exists
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    //check to see if the username does or does not already exist
    if (user) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else {
      //create a new user
      Users
        .create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
        //let client know if request was successful
        .then((user) =>{res.status(201).json(user) })
        //handle and errors that occur
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

app.get('/users/:userId', (req, res) => {
  //find a user by the username that is passed
  Users.findOne({ _id: req.params.userId })
    //retrieve data for the client
    .then((users) => {
      res.json(users);
    })
    //handle any errors that occur
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

//PUT route that allows new users to update their username by username
app.put('/users/:userId', (req, res) => {
  Users.findOneAndUpdate({ _id: req.params.userId }, { $set: 
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }, 
      (err, updatedUser) => {
        if(err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
    });

//POST route that allows users to add a movie to their list of favorites
app.post('/users/:userId/Movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ _id: req.params.userId }, {
    $push: { FavoriteMovies: req.params.MovieID }
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

//DELETE route that allows users to remove a movie from their list of favorites
app.delete('/users/:userId/Movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ _id: req.params.userId }, {
    $pull: { FavoriteMovies: req.params.MovieID }
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

//DELETE route that allows existing user to de-register
app.delete('/users/:userId', (req, res) => {
  Users.findOneAndRemove({ _id: req.params.userId })
    .then((user) => {
      if (!user) {
        res.status(400).send(user.userId + ' was not found');
      } else {
        res.status(200).send(user.Username + 'was deleted.');
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
