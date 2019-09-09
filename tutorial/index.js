'use strict';

const express = require('express');
const exphbs = require('express-handlebars');
const smartcar = require('smartcar');

const app = express();
app.engine(
  '.hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
  }),
);
app.set('view engine', '.hbs');
const port = 8000;

const mongoURI = process.env.MONGODB_URI
mongoose.connect(mongoURI, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

// TODO: Authorization Step 1: Initialize the Smartcar object
const client = new smartcar.AuthClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
  scope: ['required:read_vehicle_info', 'required:read_odometer', 'required:read_location'],
  testMode: true,
})

// global variable to save our accessToken
let access;

app.get('/login', function(req, res) {
  // TODO: Authorization Step 1b: Launch Smartcar authentication dialog
  const link = client.getAuthUrl();
  res.redirect(link);
});


app.get('/exchange', function(req, res) {
  const code = req.query.code;

  // TODO: Request Step 1: Obtain an access token
  return client.exchangeCode(code)
    .then(function(_access) {    
      // in a production app you'll want to store this in some kind of persistent storage
      access = _access;

      res.sendStatus(200);
    })
});

app.get('/vehicle', function(req, res) {
  console.log('access', access.accessToken)
  return smartcar.getVehicleIds(access.accessToken)
    .then(function(data) {
      // the list of vehicle ids
      return data.vehicles;
    })
    .then(function(vehicleIds) {
      // instantiate the first vehicle in the vehicle id list
      const vehicle = new smartcar.Vehicle(vehicleIds[0], access.accessToken);

      // TODO: Request Step 4: Make a request to Smartcar API
      return vehicle.info();
    })
    .then(function(info) {
      console.log(info);
      // {
      //   "id": "36ab27d0-fd9d-4455-823a-ce30af709ffc",
      //   "make": "TESLA",
      //   "model": "Model S",
      //   "year": 2014
      // }

      res.json(info);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
