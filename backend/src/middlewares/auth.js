
const JWT = require('jsonwebtoken')
const User = require('../models/user')

const userAuth = async (req, res, next) => {

  // extract token from cookies
  const token = req.cookies.token

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided')
  }

    try {
      const decoded = JWT.verify(token, "DEV@Tinder$790")
      const {_id} = decoded

      // you can also fetch user details from database using Id if needed
      const user = await User.findById(_id)

      if (!user) {
        return res.status(404).send('User not found')
      }

      // attach user info to request object for use in next middleware or route handler
      req.user = user
      next() // call next middleware or route handler

    } catch (err) {
      return res.status(401).send('ERROR:' + err.message)
     } 
}

module.exports ={
    userAuth
}