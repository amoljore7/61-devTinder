const express = require('express');
const profileRouter = express.Router()
const bcrypt = require('bcrypt')

const { userAuth } = require('../middlewares/auth')

const { validateProfileUpdateData, validatePasswordStrength } = require('../utils/validation')

// GET profile
profileRouter.get('/view', userAuth, async (req, res) => {

  try {
    // user info is attached to req object by auth middleware
    const user = req.user

    if (!user) {
      return res.status(404).send('User not found')
    }

    res.send(user)

  } catch (error) {
    res.status(400).send('Error fetching profile: ' + error.message)
  }

})

// UPDATE profile
profileRouter.patch('/edit', userAuth, async (req, res) => {

  try {

    if (!validateProfileUpdateData(req)) {
      throw new Error('Invalid Edit request!')
    }

    const user = req.user

    if (!user) {
      return res.status(404).send('User not found')
    }

    // update user fields with data from request body
    Object.assign(user, req.body)

    // save the updated user document to database
    await user.save()
    //why await? because save() is an asynchronous operation that returns a promise. We need to wait for the save operation to complete before sending the response back to the client. If we don't use await, the response might be sent before the user document is actually updated in the database, which could lead to inconsistencies and errors. By using await, we ensure that the user document is fully updated and saved in the database before we send the success response to the client.

    // res.send('Profile updated successfully!')
    res.json({
      message: 'Profile updated successfully!',
      data: user
    })

  } catch (error) {
    res.status(400).send('Error updating profile: ' + error.message)
  }
})

// Update Password
profileRouter.patch('/updatePassword', userAuth, async (req, res) => {
  try {
    const user = req.user

    if (!user) {
      return res.status(404).send('User not found')
    }

    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).send('Current password and new password are required')
    }

    validatePasswordStrength(newPassword)

    // compare provided password with hashed password in database
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordMatch) {
      return res.status(400).send('Password update failed: Incorrect current password')
    }

    // hash the new password before saving
    const newHashedPassword = await bcrypt.hash(newPassword, 10)

    // update user's password in database
    user.password = newHashedPassword
    await user.save()

    //when password is updated, we can also clear the token cookie to force the user to log in again with the new password for security reasons
    res.cookie('token', null, {
      expires: new Date(Date.now())
    }) // clear the token cookie by setting it to null and expiring it immediately

    res.send('Password updated successfully!')


  } catch (error) {
    res.status(400).send('Error updating password: ' + error.message)
  }
})

module.exports = profileRouter