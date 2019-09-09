var Vehicle = require('../models/vehicle');
var VehicleController = {}

VehicleController.addVehicle = async (req, res) => {
    let new_vehicle = new Vehicle(req.body)
    new_vehicle.save((err, vehicle) => {
      if (err) console.log('error updating post', err);
      res.json(vehicle);
    });
  };


  VehicleController.getAllVehicles = async (req, res) => {
    Vehicle.find({}, function(err, vehicles) {
      res.json(vehicles);  
    });
  };


  module.exports = VehicleController