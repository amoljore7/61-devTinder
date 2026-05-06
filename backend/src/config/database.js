// import mongoose library to interact with MongoDB database
const mongoose = require("mongoose")

// MongoDB connection string (URL)
// this connects to MongoDB Atlas cloud database
// devTinder is the database name that will be created in the cluster
const url = "mongodb+srv://amoljore:Amol1710121314@namastenode.v408b7h.mongodb.net/devTinder"

// function to connect to MongoDB
// mongoose.connect() returns a Promise
// so we use async/await to handle the connection
const connectDB = async () => await mongoose.connect(url)

// export the connectDB function
// so it can be imported and used in app.js or server.js
module.exports = connectDB


// | Operation        | Success Code | Error Code |
// | ---------------- | ------------ | ---------- |
// | Create user      | 201          | 400 / 409  |
// | Get user         | 200          | 404        |
// | Get all users    | 200          | 500        |
// | Update user      | 200          | 404        |
// | Delete user      | 204          | 404        |
// | Auth required    | —            | 401        |
// | Permission issue | —            | 403        |
// | Server crash     | —            | 500        |


// node-express-api/
// │
// ├── config/
// │   └── db.js
// │
// ├── controllers/
// │   └── userController.js
// │
// ├── models/
// │   └── userModel.js
// │
// ├── routes/
// │   └── userRoutes.js
// │
// ├── middleware/
// │   └── errorMiddleware.js
// │
// ├── services/
// │   └── userService.js
// │
// ├── utils/
// │   └── asyncHandler.js
// │
// ├── app.js
// └── server.js
