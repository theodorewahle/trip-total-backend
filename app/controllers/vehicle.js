var smartcar = require('smartcar')
var Vehicle = require('../models/vehicle');
var VehicleController = {}
var auth = require('../services/auth')
var Promise = require('bluebird')

VehicleController.addVehicle = async (req, res) => {
    let new_vehicle = new Vehicle(req.body)
    new_vehicle.save((err, vehicle) => {
      if (err) console.log('error updating post', err);
      res.json(vehicle);
    });
  };


  VehicleController.getAllVehicles = async (req, res) => {
    Vehicle.find({}, async function(err, vehicles) {
      all_vehicles = await Promise.map(vehicles, async vehicle => {
        const accessToken = await auth.getAccessToken(vehicle.id)
        const car = new smartcar.Vehicle(vehicle.id, accessToken)
        const latLng = await car.location()
        vehicle.coords = [latLng.data.latitude, latLng.data.longitude]
        return vehicle
      })
      res.json(vehicles);
    });
  };


  module.exports = VehicleController
