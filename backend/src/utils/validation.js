
const validator = require('validator')

const validateSignupData = (req) => {

  const { firstName, lastName, emailId, password } = req.body

  if (!firstName || !lastName) {
    throw new Error('name are required!')
  } else if (!validator.isEmail(emailId)) {
    throw new Error('email is not valid!')
  } else if (!validator.isStrongPassword(password)) {
    throw new Error('Password is not strong enough! It should be at least 8 characters long and include uppercase, lowercase, numbers, and symbols.')
  }

}

const validateProfileUpdateData = (req) => {

  const allowedEditFields = ['firstName', 'lastName', 'emailId', 'photoUrl', 'gender', 'age', 'about', 'skills']

  const isEditAllowed = Object.keys(req.body).every(field => allowedEditFields.includes(field))

  return isEditAllowed

}

const validatePasswordStrength = (password) => {
  if (!validator.isStrongPassword(password)) {
    throw new Error('Password is not strong enough! It should be at least 8 characters long and include uppercase, lowercase, numbers, and symbols.')
  }
}

module.exports = {
  validateSignupData,
  validateProfileUpdateData,
  validatePasswordStrength,
}