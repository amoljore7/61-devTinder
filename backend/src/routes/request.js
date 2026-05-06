const express = require('express');
const mongoose = require('mongoose')
const requestRouter = express.Router()

const ConnectionRequest = require('../models/connectionRequest')
const User = require('../models/user')

const { userAuth } = require('../middlewares/auth')

// POST Send Connection Request
requestRouter.post('/send/:status/:userId', userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id
    const toUserId = req.params.userId
    const status = req.params.status

    const allowedStatuses = ['ignored', 'interested']

    // validate status value
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    // prevent users from sending connection requests to themselves
    if (fromUserId.toString() === toUserId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' })
    }

    // validate toUserId format and existence
    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    // check if the recipient user exists in the database
    const toUser = await User.findById(toUserId)
    if (!toUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // check if a connection request already exists between the two users
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId }, // check for existing request in this direction
        { fromUserId: toUserId, toUserId: fromUserId } // check for existing request in either direction
      ]
    })

    // if a request already exists, return an error response
    if (existingRequest) {
      return res.status(400).json({ message: 'Connection request already exists' })
    }

    // create a new connection request with status "interested"
    const newRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status: status
    })

    const data = await newRequest.save()

    res.status(200).json({
      message: 'Connection request sent successfully',
      data
    })
  } catch (error) {
    res.status(400).send("Error: " + error.message)
  }
})

// POST review Connection Request
requestRouter.post('/review/:status/:requestId', userAuth, async (req, res) => {
  try {
    const { requestId, status } = req.params

    const loggedInUser = req.user

    // Write algo bellow
    // validate status value
    // only accepted or rejected status can be set when reviewing a connection request
    // interested and ignored status are only set when sending a connection request, not when reviewing it
    // validate that the connection request exists and belongs to the logged-in user (toUserId should match logged-in user's ID)
    // only connection requests with status "interested" can be reviewed, not those with status "ignored"
    // if all validations pass, update the status of the connection request to either "accepted" or "rejected" based on the input and save the changes to the database
    // return a success response with the updated connection request data
    // if any validation fails, return an appropriate error response with a relevant message

    const allowedStatuses = ['accepted', 'rejected']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    const connectionRequest = await ConnectionRequest.findOne(
      {
        _id: requestId,
        toUserId: loggedInUser._id,
        status: 'interested' // only interested requests can be reviewed
      }
    )
    if (!connectionRequest) {
      return res.status(404).json({ message: 'Connection request not found' })
    }

    // Status either accepted or rejected
    connectionRequest.status = status

    const data = await connectionRequest.save()

    res.status(200).json({
      message: `Connection request ${status} successfully`,
      data
    })
  } catch (error) {
    res.status(400).send("Error: " + error.message)
  }

})

module.exports = requestRouter