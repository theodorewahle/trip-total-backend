'use strict';

var Token = require('../models/token');
const smartcar = require('smartcar');
var client = require('../index')
let access;

var auth = {}

auth.getAccessToken = async (vehicleId) => {
  const tokenObject = await Token.findOne({ vehicleId })
  if (tokenObject.expiration < Date.now()) {
      const { refreshToken } = tokenObject
      await tokenObject.deleteOne({ vehicleId })
      return await refreshAccessToken(refreshToken, vehicleId)
  }
  return tokenObject.accessToken
}

const refreshAccessToken = async (refreshToken, vehicleId) => {
    return client.exchangeRefreshToken(refreshToken)
      .then(async _access => {
        access = _access;
        const tokenDocument = new Token(access)
        tokenDocument.vehicleId = vehicleId
        const expiredTokens = await Token.find({ refreshToken})

        expiredTokens.forEach(async token => {
          token.refreshToken = tokenDocument.refreshToken
          await token.save()
        })
        await tokenDocument.save()
        return tokenDocument.accessToken
      });
  }

module.exports = auth