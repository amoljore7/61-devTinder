// import mongoose library to interact with MongoDB
const mongoose = require('mongoose')
const validator = require('validator') // for email validation


// create a schema (structure of documents in the MongoDB collection)
const userSchema = new mongoose.Schema(
    {

        // first name field
        firstName: {
            type: String, // data type will be string
            required: true, // this field is required (validation)
            minLength: 4, // minimum length validation for first name
            maxLength: 50 // maximum length validation for first name
        },

        // last name field
        lastName: {
            type: String, // data type string
        },

        // email field
        emailId: {
            type: String, // email stored as string
            required: true, // this field is required (validation)

            // unique means MongoDB will not allow duplicate values
            // useful for preventing multiple accounts with same email
            unique: true,
            lowercase: true, // convert email to lowercase before saving
            trim: true, // remove whitespace from both ends of the string

            //validation function to check if the email format is correct
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error(`${value} is not a valid email!`)
                }
            }
        },

        // password field for storing user password
        password: {
            type: String, // stored as string (later you should hash it)
            required: true, // this field is required (validation)
            validate(value) {
                if (!validator.isStrongPassword(value)) {
                    throw new Error('Password is not strong enough! It should be at least 8 characters long and include uppercase, lowercase, numbers, and symbols.')
                }
            }
            //example: "Password123!" is a strong password, while "password" is not.
        },

        // age field
        age: {
            type: Number, // numeric value
            min: 18, // minimum value validation for age
            max: 100, // maximum value validation for age
        },

        // gender field
        gender: {
            type: String, // male / female / others
            validate(value) {
                if (!['male', 'female', 'others'].includes(value)) {
                    throw new Error(`${value} is not a valid gender!`);
                }
            },
        },

        photoUrl: {
            type: String,
            default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png", // default profile picture URL
            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error(`${value} is not a valid URL!`)
                }
            }
        },

        about: {
            type: String,
            default: "Hey there! I am using DevTinder." // default value if not provided
        },

        skills: {
            type: [String], // array of strings (list of skills)
            validate(value) {
                if (value.length > 10) throw new Error("Max 10 skills allowed")

                const uniqueSkills = new Set(value)
                if (uniqueSkills.size !== value.length) {
                    throw new Error("Duplicate skills not allowed")
                }
            }
        }
    },
    {
        timestamps: true // automatically add createdAt and updatedAt fields
    }
)


// create a model from the schema
// model represents a collection in MongoDB
// "User" will create a collection named "users"
const User = mongoose.model('User', userSchema)


// export the model so it can be used in other files (routes/controllers)
module.exports = User