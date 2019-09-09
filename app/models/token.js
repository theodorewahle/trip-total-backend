var mongoose = require('mongoose')

const TokenSchema = new mongoose.Schema({
  accessToken: { type: String },
  refreshToken: { type: String },
  vehicleId: { type: String, unique: true },
  expiration: { type: Date },
  refreshExpiration: { type: Date}
});

module.exports = mongoose.model('Token', TokenSchema);