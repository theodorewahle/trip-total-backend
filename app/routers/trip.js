var express = require('express')
var TripController = require('../controllers/trip')
const router = express.Router();

router.route('/start')
    .post(TripController.startTrip);

router.route('/end')
    .patch(TripController.endTrip);

router.route('/miles/:tripId')
    .get(TripController.getCurrentMiles);

router.route('/:tripId')
    .get(TripController.getTrip);

router.route('/')
    .get(TripController.getAllTrips)

module.exports = router;
