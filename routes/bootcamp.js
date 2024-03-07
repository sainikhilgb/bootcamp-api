const express = require('express')
const {getbootcamps,
    getbootcamp,
    updatebootcamp,
    createbootcamp,
    deletebootcamp,
    getBootcampInRadius,
    bootcampPhotoUpload
}=require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp')

//Include other resource router
const CourseRouter = require('./course')
const ReviewRouter = require('./reviews')

const router = express.Router()

const advanceFiltering = require('../middleware/advanceFiltering')
const {protect,authorize} = require('../middleware/auth')

//re-Route into other resourse
router.use('/:bootcampId/courses', CourseRouter)
router.use('/:bootcampId/reviews', ReviewRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius)

router.route('/:id/photo').put(protect,authorize('publisher','admin'), bootcampPhotoUpload)

router.route('/').get(advanceFiltering(Bootcamp, 'courses'),getbootcamps).post(protect, createbootcamp)

router.route('/:id').get(getbootcamp).put(protect,authorize('publisher','admin'), updatebootcamp).delete(protect,authorize('publisher','admin'), deletebootcamp)

module.exports = router