const mongoose = require('mongoose')

// create a schema for connection requests
const connectionRequestSchema = new mongoose.Schema(
    {
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId, // reference to User model
            required: true,
            ref: 'User' // reference to User model for population
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId, // reference to User model
            required: true,
            ref: 'User' // reference to User model for population
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ['ignored', 'interested', 'accepted', 'rejected'], // allowed values for status
                message: '{VALUE} is not a valid status' // error message for invalid status
            },
        }
    },
    { timestamps: true } // automatically add createdAt and updatedAt fields
)

// create a compound index to prevent duplicate connection requests between the same users
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 })


// create a model from the schema and export it
const ConnectionRequestModal = mongoose.model('ConnectionRequest', connectionRequestSchema)
module.exports = ConnectionRequestModal 