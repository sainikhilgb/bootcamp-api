const path = require('path')
const express = require('express')
const dotenv = require('dotenv') 
const morgan = require('morgan')
const colors = require('colors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const mongoSanatize = require('express-mongo-sanitize')
const helmet  = require('helmet')
const rateLimit = require('express-rate-limit')
const error = require('./middleware/error')
const connectDB = require('./config/db')



//Load env vars
dotenv.config({path: './config/config.env'})

//connect DB
connectDB()

//Router files
const bootcamps = require('./routes/bootcamp')
const courses = require('./routes/course')
const auth = require('./routes/auth')
const users = require('./routes/user')
const reviews = require('./routes/reviews')

const app = express()

//Body parser
app.use(express.json())

//cookie parser

app.use(cookieParser())

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//Fileupload 
app.use(fileUpload())

//mongo sanatize
app.use(mongoSanatize())

//security headers
app.use(helmet())

//Rate limit
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
}) 
app.use(limiter)

//static folder
app.use(express.static(path.join(__dirname,'public')))

//routers
app.use('/api/v1/bootcamps',bootcamps)
app.use('/api/v1/courses',courses)
app.use('/api/v1/auth',auth)
app.use('/api/v1/users',users)
app.use('/api/v1/reviews',reviews)

app.use(error)
const PORT = process.env.PORT || 5000


const server =app.listen(PORT,console.log(`Server started running in ${process.env.NODE_ENV} on port ${PORT}`.blue))

//Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise)=>{
console.log(`Err: ${err.message}`.red)
//close the server
server.close(()=>process.exit(1))
})