// const axios = require('axios');
const HttpError = require('../models/http-error');

const getCoordsForAddress = () => {
    return {
        lat: 40.7484474,
        lng: -73.9871516
    }
}

// const API_KEY = 'my_api_key';
// const getCoordsForAddress = async (address) => {
//     const response = await axios.get(`https://maps.googleapis.com/example/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);
//     const data = response.data
//     if(!data || data.status === 'ZERO_RESULTS') {
//         const error = new HttpError('Could not find location for the specified address', 422);
//         throw error;
//     }

//     const coordinates = data.results[0].geometry.location;

//     return coordinates;
// }

module.exports = getCoordsForAddress;