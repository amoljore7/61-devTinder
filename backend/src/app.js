// import express framework to create server and APIs
const express = require('express')
const connectDB = require('./config/database')
const app = express()
const cookieParser = require('cookie-parser')
const cors = require("cors");
const http = require("http");

// require("dotenv").config();

// require("./utils/cronjob");

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://connectify-frontend.onrender.com'],
    credentials: true,
  })
);
app.use(express.json())
app.use(cookieParser())

const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request')
const userRouter = require('./routes/user')

app.use('/', authRouter) // postman API will be like http://localhost:7777/api/auth/login
app.use('/profile', profileRouter) // postman API will be like http://localhost:7777/api/profile
app.use('/request', requestRouter) // postman API will be like http://localhost:7777/api/request/sendConnectionRequest
app.use('/user', userRouter) // postman API will be like http://localhost:7777/api/user

connectDB()
  .then(() => {
    // if database connects successfully
    console.log("Database connection established")

    // start the server on port 7777
    app.listen(7777, () => {

      // confirmation log
      console.log('Server is started on Port 7777...')

    })

  })
  .catch((err) => {

    // if database connection fails
    console.log("Database not connected", err)

  })