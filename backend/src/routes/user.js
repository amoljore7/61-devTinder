const express = require('express');
const userRouter = express.Router();

const { userAuth } = require('../middlewares/auth')
const ConnectionRequest = require('../models/connectionRequest')
const User = require('../models/user')


const USER_SAFE_FIELDS = ['firstName', 'lastName', 'emailId', 'age', 'about', 'photoUrl', 'gender', 'skills']


// Get all pending connection requests for the logged-in user
userRouter.get('/received', userAuth, async (req, res) => {

    try {
        const loggedInUserId = req.user

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUserId._id,
            status: 'interested',
        }).populate('fromUserId', USER_SAFE_FIELDS) // populate fromUserId with user details

        res.status(200).json({
            message: 'Connection requests retrieved successfully',
            data: connectionRequests
        })

    } catch (error) {
        res.status(400).json({ message: error.message });
    }

});

// Get all connection requests for the logged-in user
userRouter.get('/connections', userAuth, async (req, res) => {

    try {
        const loggedInUserId = req.user

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUserId._id, status: 'accepted' },
                { fromUserId: loggedInUserId._id, status: 'accepted' }
            ]
        })
            .populate('fromUserId', USER_SAFE_FIELDS)
            .populate('toUserId', USER_SAFE_FIELDS)
        // populate both fromUserId and toUserId with user details

        const data = connectionRequests.map(row => row.fromUserId._id.equals(loggedInUserId._id) ? row.toUserId : row.fromUserId)
        // for each connection request, determine the other user and return their details 

        res.status(200).json({
            message: 'Connections retrieved successfully',
            data: data
        })

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET you the profiles of other users platform

userRouter.get('/feed', userAuth, async (req, res) => {
    try {

        const loggedInUserId = req.user._id

        const page = parseInt(req.query.page) || 1
        let limit = parseInt(req.query.limit) || 10
        limit = limit > 50 ? 50 : limit // set a maximum limit of 50 to prevent abuse
        const skip = (page - 1) * limit

        // get all users that are connected to the logged-in user
        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUserId },
                { toUserId: loggedInUserId }
            ]
        }).select('fromUserId toUserId -_id')
        // .populate('fromUserId', USER_SAFE_FIELDS)
        // .populate('toUserId', USER_SAFE_FIELDS)

        const hideUsersFromFeed = new Set()

        connections.forEach(req => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        })

        const users = await User.find({
            $and: [
                { _id: { $ne: loggedInUserId } },
                { _id: { $nin: Array.from(hideUsersFromFeed) } }
            ]
        }).select(USER_SAFE_FIELDS).skip(skip).limit(limit) // only select safe fields and apply pagination 


        res.status(200).json({
            message: 'User feed retrieved successfully',
            data: users
        })

    } catch (error) {
        res.status(400).json({ message: error.message });
    }

});

module.exports = userRouter;