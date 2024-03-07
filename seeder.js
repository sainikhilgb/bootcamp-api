const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const colors = require('colors')


//load env var
dotenv.config({path: './config/config.env'})

//load models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/course')
const User = require('./models/User')
const Reviews = require('./models/reviews')

//connect db
mongoose.connect(process.env.MONGO_URL)
 

//Read the JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`,'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`,'utf-8'))
const users =JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`,'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`,'utf-8'))

//Import data into DB
const ImportDB = async()=>{
    try {
        await Bootcamp.create(bootcamps)
        await Course.create(courses)
        await User.create(users)
        await Reviews.create(reviews)
        console.log('Data Imported ...'.green.inverse)
        process.exit()
    } catch (err) {
        console.error(err)
    }
}

//Delet data
const DeletData = async()=>{
    try {
        await Bootcamp.deleteMany()
        await Course.deleteMany()
        await User.deleteMany()
        await Reviews.deleteMany()
        console.log('Data Destroyed ...'.red.inverse)
        process.exit()
    } catch (err) {
        console.error(err)
    }
}


if(process.argv[2] === '-i'){
    ImportDB()
}else if(process.argv[2]==='-d'){
    DeletData()
}