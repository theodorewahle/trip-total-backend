var mongoose = require('mongoose')

const TripSchema = new mongoose.Schema({
  vehicleId : { type: String },
  startMiles: { type: Number },
  startDate : { type: Date, default: Date.now },
  inProgress: { type: Boolean, default: true },
  endDate : { type: Date, default: null },
  milesOfDepreciation : { type: Number, default: 0 },
  depreciationCost: { type: Number, default: 0},
  vehicle: {
    make: { type: String },
    model: { type: String },
    year: { type: Number }
  }
});
 
module.exports = mongoose.model('Trip', TripSchema);