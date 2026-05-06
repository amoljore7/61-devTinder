const express = require('express');

const authRouter = express.Router()

const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const User = require('../models/user')
const { userAuth } = require('../middlewares/auth')
const { validateSignupData } = require('../utils/validation')


// SIGNUP API:
authRouter.post('/signup', async (req, res) => {
  try {

    //validation of the data
    validateSignupData(req)

    const { firstName, lastName, emailId, password } = req.body

    //encrypting the password before saving to database
    const passwordHash = await bcrypt.hash(password, 10) // 10 is the salt rounds for hashing

    // replace plain password with hashed password in request body
    req.body.password = passwordHash

    // create new User document using request body data
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash
    })

    // save the user document to MongoDB
    const savedUser =await user.save()

    const token = JWT.sign({ _id: savedUser._id }, "DEV@Tinder$790", { expiresIn: "1d" })

    res.cookie('token', token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // cookie expires in 1 day
    })

    // send success response
    res.json({ message: 'User Added successfully...!', data: savedUser })

  } catch (err) {

    // if any error happens (validation, db error)
    res.status(400).json({ message: "ERROR: " + err.message })

  }
})

// Login API
authRouter.post('/login', async (req, res) => {

  try {
    const { emailId, password } = req.body

    // find user by email
    const user = await User.findOne({ emailId: emailId })

    if (!user) {
      return res.status(400).send('Login failed: User not found')
    }

    // compare provided password with hashed password in database
    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return res.status(400).send('Login failed: Incorrect password')
    }

    //create JWT token here and send to client for authentication in future requests

    const token = JWT.sign({ _id: user._id }, "DEV@Tinder$790", { expiresIn: "1d" })

    res.cookie('token', token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // cookie expires in 1 day
    })
    res.send(user)

  } catch (error) {
    res.status(400).send('ERROR: ' + error.message)
  }
})

//LOGOUT API
authRouter.post('/logout', async (req, res) => {
  try {
    res.cookie('token', null, {
      expires: new Date(Date.now())
    }) // clear the token cookie by setting it to null and expiring it immediately
    res.send('Logout successful!')
  } catch (error) {
    res.status(400).send('ERROR: ' + error.message)
  }
})



module.exports = authRouter