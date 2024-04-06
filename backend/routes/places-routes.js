const express = require('express');
const {check} = require('express-validator')
const router = express.Router();
const fileUpload = require('../middleware/fileUpload-middleware')
const placesController = require('../controllers/places-controller');


router.get('/:pid', placesController.getPlaceById);

router.get('/user/:uid', placesController.getPlacesByUserId);

router.post('/', 
  fileUpload.single('image'),
[
    check('title').notEmpty(),
    check('description').isLength({min: 5}),
    check('address').notEmpty()
] 
,placesController.createPlace);

router.patch('/:pid', 
[
    check('title').notEmpty(),
    check('description').isLength({min: 5}),
], placesController.updatePlace);

router.delete('/:pid', placesController.deletePlace);

module.exports = router