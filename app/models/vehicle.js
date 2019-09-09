var mongoose = require('mongoose')

const VehicleSchema = new mongoose.Schema({
  id: { type: String},
  make: { type: String },
  model: { type: String },
  year: { type: Number },
  isBeingRented: { type: Boolean, default: false },
  currentTripId: { type: String, default: "" },
  coords: { type: Array, default: []}
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
