var express = require('express')
var VehicleController = require('../controllers/vehicle')
const router = express.Router();

router.route('/add')
    .post(VehicleController.addVehicle);

router.route('/all')
    .get(VehicleController.getAllVehicles);

router.route('/delete')
    .get(VehicleController.addVehicle);

module.exports = router;

