const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/placeModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');


const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (error) {
        const err = new HttpError('Could not find a place for the provided id', 500)
        return next(err);
    }

    if (!place) {
        const err = new HttpError('Could not find place for the provided Id', 404);
        return next(err);
    }
    res.json({ place: place.toObject({ getters: true }) });
};
 
const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    //let places => used to find by creator 
    let userWithPlaces
    try {
        userWithPlaces = await User.findById(userId).populate('places')
    } catch (error) {
        const err = new HttpError('Failed while fetching, try again', 500);
        return next(err);
    }

    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(
            new HttpError('Could not find places for the provided userId', 404)
        );
    }
    res.json({ places: userWithPlaces.places.map((p) => p.toObject({ getters: true })) }); //toObject works for one object only
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors);
        return next(new HttpError('Invalid inputs passed , please check data', 422));
    }

    //const { title, description, coordinates, address, creator } = req.body;
    const { title, description, address, creator } = req.body;
    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }


    const createdPlace = new Place({
        title,
        description,
        location: coordinates,
        address,
        image: 'https://google.opng',
        creator
    });

    let user;

    try {
        user = await User.findById(creator);
        if (!user) {
            const err = new HttpError('Could not find user for provided Id!', 404);
            return next(err);
        }
    } catch (error) {
        const err = new HttpError('Creating place for user failed, please try again', 500);
        return next(err)
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction(); //Only after this point changes is really saved in dataBase

    } catch (err) {
        const error = new HttpError('Creating place with user failed, please try again', 500);
        return next(error, console.log(err));

    }

    res.status(201).json({ place: createdPlace });
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors);
        throw new HttpError('Invalid inputs passed , please check data', 422)
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place
    try {
        place = await Place.findById(placeId)
    } catch (error) {
        const err = new HttpError('Something went wrong, Could not update place', 500);
        return next(err);
    }

    if (!place) {
        return res.status(404).json({ message: 'Could not find any places with the placeId' })
    }

    place.title = title;
    place.description = description;

    try {
        await place.save()
    } catch (error) {
        const err = new HttpError('Something went wrong, Could not update place', 500);
        return next(err);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (error) {
        const err = new HttpError('Failed to delete the place, try again', 500)
        return next(err);
    }

    if (!place) {
        const err = new HttpError('Could not find place for that id.', 404);
        return next(err);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.deleteOne({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction()
    } catch (error) {
        const err = new HttpError('Something went wrong, try again', 500)
        return next(err, console.log(error));
    }

    res.status(200).json({ message: 'Deleted place' })
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;