const express = require('express')
const {getCourses, getCourse,addCourse, UpdateCourse, DeleteCourse
}=require('../controllers/courses')

const Course = require('../models/course')

const router = express.Router({mergeParams: true})

const advanceFiltering = require('../middleware/advanceFiltering')
const {protect,authorize} = require('../middleware/auth')

router.route('/').get(advanceFiltering(Course,{
    path: 'bootcamp',
    select: 'name description'
}),getCourses).post(protect,authorize('publisher','admin'), addCourse)

router.route('/:id').get(getCourse).put(protect,authorize('publisher','admin'), UpdateCourse).delete(protect,authorize('publisher','admin'), DeleteCourse)

module.exports = router
