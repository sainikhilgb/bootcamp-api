const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../models/course')
const Bootcamp = require('../models/Bootcamp')

//dec   GET Courses
//rout   GET api/v1/courses
//rout   GET api/v1/bootcamps/:bootcamId/courses
//access   Public
exports.getCourses = asyncHandler(async (req,res,next)=>{
    if(req.params.bootcampId){
       const courses = await Course.find({bootcamp: req.params.bootcampId})

       return res.status(200).json({
         success: true,
         count: courses.length,
         data: courses
       })
    }else{
        res.status(200).json(res.advanceFiltering)
    }
   })

   
//dec   GET a single Courses
//rout   GET api/v1/courses/:id
//access   Public
exports.getCourse = asyncHandler(async (req,res,next)=>{
   
 
     const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
     })

     if(!course){
        return next(new ErrorResponse(`No course with id ${req.params.id}`),404)
     }
     res.status(200).json({
         sucess: true,
         data:  course
       })
    })


//dec   add a new course
//rout   POST api/v1/bootcamps/:bootcamId/courses
//access   Private
exports.addCourse = asyncHandler(async (req,res,next)=>{
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

     const bootcamp = await Bootcamp.findById(req.params.bootcampId)

     if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp with bootcampid ${req.params.bootcampId}`),404)
     }
     //make sure user is bootcamp owner
   if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
      return next(new ErrorResponse(`User id ${req.user.id} is not authorized to add a course to ${bootcamp._id}`,401))
    }

     const course = await Course.create(req.body)

     res.status(200).json({
         sucess: true,
         data:  course
       })
    })


//dec   Update the course
//rout  PUT api/v1/courses/:id
//access   Private
exports.UpdateCourse = asyncHandler(async (req,res,next)=>{

    let course = await Course.findById(req.params.id)

    if(!course){
       return next(new ErrorResponse(`No course available with id ${req.params.id}`),404)
    }

      //make sure user is course owner
   if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
      return next(new ErrorResponse(`User id ${req.user.id} is not authorized to update  ${course._id}`,401))
    }

    course = await Course.findByIdAndUpdate(req.params.id,req.body,{new: true,runValidators: true})

    res.status(200).json({
        sucess: true,
        data:  course
      })
   })


//dec   Delete the course
//rout  DELETE api/v1/courses/:id
//access   Private
exports.DeleteCourse = asyncHandler(async (req,res,next)=>{

   const course = await Course.findById(req.params.id)

   if(!course){
      return next(new ErrorResponse(`No course available with id ${req.params.id}`),404)
   }
      //make sure user is course owner
      if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
         return next(new ErrorResponse(`User id ${req.user.id} is not authorized to delete  ${course._id}`,401))
       }

  await course.deleteOne()

   res.status(200).json({
       sucess: true,
       data:  [`Course with ${req.params.id} is deleted`]
     })
  })