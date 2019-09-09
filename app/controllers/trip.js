var Trip = require('../models/trip');
var Vehicle = require('../models/vehicle');
var TripController = {}

var auth = require('../services/auth')
const smartcar = require('smartcar');
var Promise = require("bluebird");

const getOdometeReading = async carId => {
    const accessToken = await auth.getAccessToken(carId)
    const car = new smartcar.Vehicle(carId, accessToken)
    const vehicleInfo = await car.odometer()
    return vehicleInfo.data.distance
}

TripController.startTrip = async (req, res) => {
    const { vehicleId } = req.body
    const carBeingUsedForThisTrip = await Vehicle.findOne({ id: vehicleId })
    const milesTraveledOnCar = await getOdometeReading(vehicleId)
    const newTrip = new Trip({ 
        vehicleId, startMiles: milesTraveledOnCar
    })

    carBeingUsedForThisTrip.isBeingRented = true
    carBeingUsedForThisTrip.currentTripId = newTrip._id

    await newTrip.save()
    await carBeingUsedForThisTrip.save()
    
    res.json(newTrip)
  };


  TripController.endTrip = async (req, res) => {
    const { vehicleId } = req.body

    const car = await Vehicle.findOne({ id: vehicleId })
    const trip = await Trip.findById(car.currentTripId)
   

    const milesTraveledOnCar = await getOdometeReading(trip.vehicleId)
    trip.inProgress = false
    trip.milesOfDepreciation = Math.abs(parseFloat(milesTraveledOnCar) - trip.startMiles)
    trip.depreciationCost = trip.milesOfDepreciation * 0.08
    trip.endDate = Date.now()

    car.currentTripId = ""
    car.isBeingRented = false

    await car.save()
    await trip.save()
    
    res.json(trip) 
  };


  TripController.getCurrentMiles = async (req, res) => {
    const { tripId } = req.params

    const trip = await Trip.findById(tripId)
    const { vehicleId } = trip
    const milesTraveledOnCar = await getOdometeReading(vehicleId)

    return milesTraveledOnCar - trip.startMiles

  };

  TripController.getTrip = async (req, res) => {
    const { tripId } = req.params

    const trip = await Trip.findById(tripId)
    const { vehicleId } = trip
    const milesTraveledOnCar = await getOdometeReading(vehicleId)

    const totalTripMiles = milesTraveledOnCar - trip.startMiles
    trip.milesTraveled = totalTripMiles
    res.json(trip)
  };

  TripController.getAllTrips = async (req, res) => {
    allTrips = await Trip.find()
    tripsWithVehicle = await Promise.map(allTrips, async trip => {
      const { vehicleId } = trip
      const vehicle = await Vehicle.findOne({ id : vehicleId})
      trip.vehicle = vehicle
      return trip
    })
    res.json({ trips: allTrips})
  }



  module.exports = TripController

