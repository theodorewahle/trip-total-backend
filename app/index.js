'use strict';

const express = require('express');
const exphbs = require('express-handlebars');
const smartcar = require('smartcar');
const cors = require('cors')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var Promise = require("bluebird");
var Token = require('./models/token');




const client = new smartcar.AuthClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
  scope: ['required:read_vehicle_info', 'required:read_odometer'],
  testMode: true,
});

module.exports = client



var auth = require('./services/auth')

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

const vehicleRouter = require('./routers/vehicle')
const tripRouter = require('./routers/trip')

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




let access;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/vehicle', vehicleRouter);
app.use('/trip', tripRouter)


app.get('/login', function(req, res) {
  const authUrl = client.getAuthUrl();

  res.render('home', {
    url: authUrl,
  });
});

const exchangeCodeForAccessToken = async code => {
  return client.exchangeCode(code)
    .then(async _access => {
      access = _access;
      const vehicleIds = await smartcar.getVehicleIds(access.accessToken)
      vehicleIds.vehicles.forEach(async vehicleId => {
        const tokenDocument = new Token(access)
        tokenDocument.vehicleId = vehicleId
        await tokenDocument.save()
      })

      return access.accessToken
    });
}

app.get('/exchange', async function(req, res) {
  const code = req.query.code;

  const tokenObject = await Token.findOne({ userId: "1234"})
  if (tokenObject) {
    await tokenObject.deleteOne({ vehicleId })
  }

  return await exchangeCodeForAccessToken(code).then(accessToken => {
    res.redirect('/vehicleList');
  })
});

app.get('/vehicleList', async function(req, res) {

  return smartcar.getVehicleIds(access.accessToken)
    .then(async data => {

      const vehicleIds = data.vehicles;
      const vehicleList = await Promise.map(vehicleIds, async id => {
        const car = new smartcar.Vehicle(id, access.accessToken)
        const vehicleInfo = await car.info()
        return vehicleInfo
      });


      return vehicleList
    })
    .then(function(info) {
      res.send(info)
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
